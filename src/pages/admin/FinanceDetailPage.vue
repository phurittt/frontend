<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { api } from 'src/boot/axios';
import { useFinanceStore } from 'src/stores/finance-store';

const route = useRoute();
const router = useRouter();
const $q = useQuasar();
const financeStore = useFinanceStore();

const projectId = computed(() => Number(route.params.projectId));

// ─── Project & Registration data ──────────────────────────────────────────────

interface ProjectDetail {
  id: number;
  name: string;
  projectYear: string;
  trainingStartDate: string | null;
  trainingEndDate: string | null;
  registrationFee: number;
  lecturerRemuneration: number;
  course?: { title: string; duration_hours?: number } | null;
  manager?: { firstName: string; lastName: string } | null;
}

const project = ref<ProjectDetail | null>(null);
const registrations = ref<any[]>([]);
const isLoading = ref(false);

onMounted(async () => {
  isLoading.value = true;
  try {
    const [projRes, regRes] = await Promise.all([
      api.get(`/projects/${projectId.value}`),
      api.get(`/registrations/project/${projectId.value}`),
    ]);
    project.value = projRes.data;
    registrations.value = regRes.data;
    await financeStore.fetchByProject(projectId.value);
  } catch {
    $q.notify({ type: 'negative', message: 'ไม่สามารถโหลดข้อมูลได้', position: 'top' });
    router.push('/admin/finance');
  } finally {
    isLoading.value = false;
  }
});

// ─── Auto-computed rows ────────────────────────────────────────────────────────

// Income from participants with attended or missed status (not waiting list)
const paidParticipants = computed(() =>
  registrations.value.filter(
    (r) =>
      !r.isWaitingList && (r.attendanceStatus === 'attended' || r.attendanceStatus === 'missed'),
  ),
);

const autoIncomeAmount = computed(
  () => paidParticipants.value.length * Number(project.value?.registrationFee || 0),
);

const autoIncomeLabel = computed(() => {
  const fee = Number(project.value?.registrationFee || 0);
  const count = paidParticipants.value.length;
  if (fee === 0) return 'ค่าลงทะเบียน (ไม่มีค่าใช้จ่าย)';
  return `ค่าลงทะเบียน — ${count} คน × ${fee.toLocaleString()} บาท`;
});

const autoExpenseAmount = computed(() => Number(project.value?.lecturerRemuneration || 0));

// ─── Totals ───────────────────────────────────────────────────────────────────

const totalIncome = computed(
  () => autoIncomeAmount.value + financeStore.incomeRecords.reduce((s, r) => s + r.amount, 0),
);

const totalExpense = computed(
  () => autoExpenseAmount.value + financeStore.expenseRecords.reduce((s, r) => s + r.amount, 0),
);

const balance = computed(() => totalIncome.value - totalExpense.value);

// ─── Add Record Dialog ────────────────────────────────────────────────────────

const showDialog = ref(false);
const dialogType = ref<'income' | 'expense'>('income');
const addForm = ref({ description: '', amount: '', date: '' });
const isSaving = ref(false);

const openAddDialog = (type: 'income' | 'expense') => {
  dialogType.value = type;
  addForm.value = { description: '', amount: '', date: new Date().toISOString().slice(0, 10) };
  showDialog.value = true;
};

const saveRecord = async () => {
  if (!addForm.value.description.trim()) {
    $q.notify({ message: 'กรุณากรอกรายละเอียด', color: 'warning', position: 'top' });
    return;
  }
  const amount = Number(addForm.value.amount);
  if (!amount || amount <= 0) {
    $q.notify({ message: 'กรุณากรอกจำนวนเงินที่ถูกต้อง', color: 'warning', position: 'top' });
    return;
  }
  if (!addForm.value.date) {
    $q.notify({ message: 'กรุณาเลือกวันที่', color: 'warning', position: 'top' });
    return;
  }
  isSaving.value = true;
  try {
    await financeStore.addRecord({
      projectId: projectId.value,
      type: dialogType.value,
      amount,
      description: addForm.value.description.trim(),
      date: addForm.value.date,
    });
    showDialog.value = false;
    $q.notify({
      message: `เพิ่ม${dialogType.value === 'income' ? 'รายรับ' : 'รายจ่าย'}สำเร็จ`,
      color: 'positive',
      icon: 'check_circle',
      position: 'top',
    });
  } catch {
    $q.notify({ message: 'เกิดข้อผิดพลาด กรุณาลองใหม่', color: 'negative', position: 'top' });
  } finally {
    isSaving.value = false;
  }
};

const finishAndGoBack = () => {
  $q.notify({
    type: 'positive',
    message: 'บันทึกข้อมูลการเงินเรียบร้อยแล้ว',
    icon: 'check_circle',
    position: 'top',
  });
  router.push('/admin/finance');
};

const deleteRecord = (id: number) => {
  $q.dialog({
    title: 'ยืนยันการลบ',
    message: 'ต้องการลบรายการนี้ใช่หรือไม่?',
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await financeStore.removeRecord(id);
      $q.notify({ message: 'ลบรายการสำเร็จ', color: 'positive', position: 'top' });
    } catch {
      $q.notify({ message: 'ลบไม่สำเร็จ', color: 'negative', position: 'top' });
    }
  });
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(d: string | null | undefined) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('th-TH', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatMoney(n: number) {
  return n.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
</script>

<template>
  <q-page class="q-pb-xl">
    <!-- Header -->
    <div class="row items-center q-mb-lg">
      <q-btn flat round icon="arrow_back" color="grey-8" @click="router.push('/admin/finance')" />
      <div>
        <div class="text-h6 text-weight-bold">รายรับ-รายจ่าย</div>
        <div v-if="project" class="text-caption text-grey-6 q-mt-xs">
          <span class="text-primary text-weight-bold">{{ project.name }}</span>
          <span v-if="project.course?.title" class="q-ml-sm">— {{ project.course.title }}</span>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading || financeStore.isLoading" class="text-center q-py-xl">
      <q-spinner-dots color="primary" size="48px" />
    </div>

    <template v-else-if="project">
      <!-- Project Info -->
      <q-card flat bordered class="bg-white q-pa-lg q-mb-lg" style="border-radius: 12px">
        <div class="text-subtitle1 text-weight-bold q-mb-md">รายละเอียดโครงการ</div>
        <div class="row q-col-gutter-lg">
          <div class="col-12 col-md-6">
            <div class="row q-mb-xs">
              <div class="col-5 text-grey-6">ชื่อโครงการ:</div>
              <div class="col-7 text-weight-medium">{{ project.name }}</div>
            </div>
            <div class="row q-mb-xs">
              <div class="col-5 text-grey-6">หลักสูตร:</div>
              <div class="col-7">{{ project.course?.title || '-' }}</div>
            </div>
            <div class="row q-mb-xs">
              <div class="col-5 text-grey-6">ปีงบประมาณ:</div>
              <div class="col-7">{{ project.projectYear }}</div>
            </div>
          </div>
          <div class="col-12 col-md-6">
            <div class="row q-mb-xs">
              <div class="col-5 text-grey-6">วันที่อบรม:</div>
              <div class="col-7">
                {{ formatDate(project.trainingStartDate) }}
                <span v-if="project.trainingEndDate">
                  — {{ formatDate(project.trainingEndDate) }}</span
                >
              </div>
            </div>
            <div class="row q-mb-xs">
              <div class="col-5 text-grey-6">ค่าลงทะเบียน:</div>
              <div class="col-7 text-weight-medium">
                {{
                  Number(project.registrationFee) === 0
                    ? 'ฟรี'
                    : `${Number(project.registrationFee).toLocaleString()} บาท/คน`
                }}
              </div>
            </div>
            <div class="row q-mb-xs">
              <div class="col-5 text-grey-6">ค่าตอบแทนวิทยากร:</div>
              <div class="col-7 text-weight-medium">
                {{
                  Number(project.lecturerRemuneration) > 0
                    ? `${Number(project.lecturerRemuneration).toLocaleString()} บาท`
                    : '-'
                }}
              </div>
            </div>
          </div>
        </div>
      </q-card>

      <!-- Summary Cards -->
      <div class="row q-col-gutter-md q-mb-lg">
        <div class="col-12 col-sm-4">
          <q-card
            flat
            class="bg-green-1 q-pa-lg text-center"
            style="border-radius: 12px; border: 1px solid #a5d6a7"
          >
            <q-icon name="arrow_downward" color="green-7" size="28px" />
            <div class="text-caption text-green-8 text-weight-bold q-mt-xs">รายรับทั้งหมด</div>
            <div class="text-h5 text-weight-bolder text-green-8 q-mt-sm">
              {{ formatMoney(totalIncome) }}
              <span class="text-caption text-green-7"> บาท</span>
            </div>
          </q-card>
        </div>
        <div class="col-12 col-sm-4">
          <q-card
            flat
            class="bg-red-1 q-pa-lg text-center"
            style="border-radius: 12px; border: 1px solid #ef9a9a"
          >
            <q-icon name="arrow_upward" color="red-7" size="28px" />
            <div class="text-caption text-red-8 text-weight-bold q-mt-xs">รายจ่ายทั้งหมด</div>
            <div class="text-h5 text-weight-bolder text-red-8 q-mt-sm">
              {{ formatMoney(totalExpense) }}
              <span class="text-caption text-red-7"> บาท</span>
            </div>
          </q-card>
        </div>
        <div class="col-12 col-sm-4">
          <q-card
            flat
            class="q-pa-lg text-center"
            :class="balance >= 0 ? 'bg-blue-1' : 'bg-orange-1'"
            :style="`border-radius: 12px; border: 1px solid ${balance >= 0 ? '#90caf9' : '#ffcc80'}`"
          >
            <q-icon
              :name="balance >= 0 ? 'account_balance' : 'warning'"
              :color="balance >= 0 ? 'blue-7' : 'orange-7'"
              size="28px"
            />
            <div
              class="text-caption text-weight-bold q-mt-xs"
              :class="balance >= 0 ? 'text-blue-8' : 'text-orange-8'"
            >
              ยอดคงเหลือ
            </div>
            <div
              class="text-h5 text-weight-bolder q-mt-sm"
              :class="balance >= 0 ? 'text-blue-8' : 'text-orange-8'"
            >
              {{ formatMoney(balance) }}
              <span class="text-caption"> บาท</span>
            </div>
          </q-card>
        </div>
      </div>

      <!-- Income Section -->
      <q-card flat bordered class="bg-white q-pa-lg q-mb-lg" style="border-radius: 12px">
        <div class="row items-center justify-between q-mb-md">
          <div class="row items-center q-gutter-sm">
            <q-icon name="arrow_downward" color="green-7" size="20px" />
            <span class="text-subtitle1 text-weight-bold text-green-8">รายรับ</span>
            <q-badge color="green-2" text-color="green-9" class="text-weight-bold">
              {{ formatMoney(totalIncome) }} บาท
            </q-badge>
          </div>
          <q-btn
            unelevated
            color="green-1"
            text-color="green-8"
            icon="add"
            label="เพิ่มรายรับ"
            no-caps
            size="sm"
            class="text-weight-bold q-px-md"
            style="border-radius: 8px"
            @click="openAddDialog('income')"
          />
        </div>

        <q-table
          flat
          bordered
          :rows="[]"
          :columns="[
            { name: 'no', label: 'ลำดับ', field: 'no', align: 'center', style: 'width: 60px' },
            { name: 'description', label: 'รายการ', field: 'description', align: 'left' },
            {
              name: 'amount',
              label: 'จำนวนเงิน (บาท)',
              field: 'amount',
              align: 'right',
              style: 'width: 160px',
            },
            {
              name: 'date',
              label: 'วันที่',
              field: 'date',
              align: 'center',
              style: 'width: 130px',
            },
            { name: 'actions', label: '', field: 'actions', align: 'center', style: 'width: 60px' },
          ]"
          hide-bottom
          table-header-class="bg-green-1 text-weight-bold text-green-9"
        >
          <template v-slot:top-row>
            <!-- Auto income row -->
            <tr class="bg-green-50">
              <td class="text-center text-caption text-grey-6">1</td>
              <td>
                <div class="row items-center q-gutter-xs">
                  <q-icon name="auto_awesome" color="green-6" size="14px" />
                  <span class="text-weight-medium">{{ autoIncomeLabel }}</span>
                  <q-badge color="green-2" text-color="green-9" label="อัตโนมัติ" size="xs" />
                </div>
              </td>
              <td class="text-right text-weight-bold text-green-8">
                {{ formatMoney(autoIncomeAmount) }}
              </td>
              <td class="text-center text-caption text-grey-6">
                {{ formatDate(project.trainingStartDate) }}
              </td>
              <td></td>
            </tr>

            <!-- Manual income rows -->
            <tr v-for="(rec, idx) in financeStore.incomeRecords" :key="rec.id">
              <td class="text-center text-caption text-grey-6">{{ idx + 2 }}</td>
              <td class="text-weight-medium">{{ rec.description }}</td>
              <td class="text-right text-weight-bold text-green-8">
                {{ formatMoney(rec.amount) }}
              </td>
              <td class="text-center text-caption text-grey-6">{{ formatDate(rec.date) }}</td>
              <td class="text-center">
                <q-btn
                  flat
                  round
                  dense
                  size="sm"
                  icon="delete"
                  color="negative"
                  @click="deleteRecord(rec.id)"
                >
                  <q-tooltip>ลบรายการ</q-tooltip>
                </q-btn>
              </td>
            </tr>
          </template>
        </q-table>
      </q-card>

      <!-- Expense Section -->
      <q-card flat bordered class="bg-white q-pa-lg q-mb-lg" style="border-radius: 12px">
        <div class="row items-center justify-between q-mb-md">
          <div class="row items-center q-gutter-sm">
            <q-icon name="arrow_upward" color="red-7" size="20px" />
            <span class="text-subtitle1 text-weight-bold text-red-8">รายจ่าย</span>
            <q-badge color="red-2" text-color="red-9" class="text-weight-bold">
              {{ formatMoney(totalExpense) }} บาท
            </q-badge>
          </div>
          <q-btn
            unelevated
            color="red-1"
            text-color="red-8"
            icon="add"
            label="เพิ่มรายจ่าย"
            no-caps
            size="sm"
            class="text-weight-bold q-px-md"
            style="border-radius: 8px"
            @click="openAddDialog('expense')"
          />
        </div>

        <q-table
          flat
          bordered
          :rows="[]"
          :columns="[
            { name: 'no', label: 'ลำดับ', field: 'no', align: 'center', style: 'width: 60px' },
            { name: 'description', label: 'รายการ', field: 'description', align: 'left' },
            {
              name: 'amount',
              label: 'จำนวนเงิน (บาท)',
              field: 'amount',
              align: 'right',
              style: 'width: 160px',
            },
            {
              name: 'date',
              label: 'วันที่',
              field: 'date',
              align: 'center',
              style: 'width: 130px',
            },
            { name: 'actions', label: '', field: 'actions', align: 'center', style: 'width: 60px' },
          ]"
          hide-bottom
          table-header-class="bg-red-1 text-weight-bold text-red-9"
        >
          <template v-slot:top-row>
            <!-- Auto expense row (speaker fee) — only show if > 0 -->
            <tr v-if="autoExpenseAmount > 0" class="bg-red-50">
              <td class="text-center text-caption text-grey-6">1</td>
              <td>
                <div class="row items-center q-gutter-xs">
                  <q-icon name="auto_awesome" color="red-6" size="14px" />
                  <span class="text-weight-medium">ค่าตอบแทนวิทยากร</span>
                  <q-badge color="red-2" text-color="red-9" label="อัตโนมัติ" size="xs" />
                </div>
              </td>
              <td class="text-right text-weight-bold text-red-8">
                {{ formatMoney(autoExpenseAmount) }}
              </td>
              <td class="text-center text-caption text-grey-6">
                {{ formatDate(project.trainingStartDate) }}
              </td>
              <td></td>
            </tr>

            <!-- Manual expense rows -->
            <tr v-for="(rec, idx) in financeStore.expenseRecords" :key="rec.id">
              <td class="text-center text-caption text-grey-6">
                {{ autoExpenseAmount > 0 ? idx + 2 : idx + 1 }}
              </td>
              <td class="text-weight-medium">{{ rec.description }}</td>
              <td class="text-right text-weight-bold text-red-8">{{ formatMoney(rec.amount) }}</td>
              <td class="text-center text-caption text-grey-6">{{ formatDate(rec.date) }}</td>
              <td class="text-center">
                <q-btn
                  flat
                  round
                  dense
                  size="sm"
                  icon="delete"
                  color="negative"
                  @click="deleteRecord(rec.id)"
                >
                  <q-tooltip>ลบรายการ</q-tooltip>
                </q-btn>
              </td>
            </tr>

            <!-- Empty state -->
            <tr v-if="autoExpenseAmount === 0 && financeStore.expenseRecords.length === 0">
              <td colspan="5" class="text-center text-grey-5 q-py-lg">
                <q-icon name="receipt_long" size="32px" class="q-mb-sm opacity-40" /><br />
                ยังไม่มีรายจ่าย
              </td>
            </tr>
          </template>
        </q-table>
      </q-card>

      <!-- Finish Button -->
      <div class="row justify-end q-mt-lg">
        <q-btn
          unelevated
          color="dark"
          text-color="white"
          icon="check_circle"
          label="เสร็จสิ้น"
          no-caps
          class="text-weight-bold q-px-xl"
          style="border-radius: 10px"
          :disable="financeStore.isLoading"
          @click="finishAndGoBack"
        />
      </div>
    </template>

    <!-- Add Record Dialog -->
    <q-dialog v-model="showDialog" persistent>
      <q-card style="width: 460px; max-width: 95vw; border-radius: 12px">
        <q-card-section
          class="row items-center q-pb-none q-mb-md"
          style="border-bottom: 1px solid #ebebeb; padding-bottom: 12px"
        >
          <q-icon
            :name="dialogType === 'income' ? 'arrow_downward' : 'arrow_upward'"
            :color="dialogType === 'income' ? 'green-7' : 'red-7'"
            size="20px"
            class="q-mr-sm"
          />
          <div class="text-h6 text-weight-bold">
            {{ dialogType === 'income' ? 'เพิ่มรายรับ' : 'เพิ่มรายจ่าย' }}
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-md">
          <div class="q-mb-md">
            <div class="text-caption text-weight-bold text-grey-7 q-mb-xs">
              รายละเอียด <span class="text-negative">*</span>
            </div>
            <q-input
              outlined
              dense
              v-model="addForm.description"
              :placeholder="
                dialogType === 'income' ? 'เช่น รายรับพิเศษ...' : 'เช่น ค่าเช่าสถานที่...'
              "
              autofocus
            />
          </div>
          <div class="q-mb-md">
            <div class="text-caption text-weight-bold text-grey-7 q-mb-xs">
              จำนวนเงิน (บาท) <span class="text-negative">*</span>
            </div>
            <q-input
              outlined
              dense
              v-model="addForm.amount"
              type="number"
              min="0"
              placeholder="0.00"
              :input-class="dialogType === 'income' ? 'text-green-8' : 'text-red-8'"
            >
              <template #append><span class="text-grey-6 text-caption">บาท</span></template>
            </q-input>
          </div>
          <div class="q-mb-lg">
            <div class="text-caption text-weight-bold text-grey-7 q-mb-xs">
              วันที่ <span class="text-negative">*</span>
            </div>
            <q-input outlined dense v-model="addForm.date" type="date" />
          </div>

          <div class="row justify-end q-gutter-sm">
            <q-btn
              flat
              label="ยกเลิก"
              color="grey-8"
              v-close-popup
              style="border: 1px solid #ddd"
            />
            <q-btn
              unelevated
              :color="dialogType === 'income' ? 'positive' : 'negative'"
              :label="dialogType === 'income' ? 'เพิ่มรายรับ' : 'เพิ่มรายจ่าย'"
              class="q-px-lg text-weight-bold"
              :loading="isSaving"
              @click="saveRecord"
            />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<style scoped>
:deep(.q-table th) {
  font-size: 12px;
}
:deep(.q-table td) {
  font-size: 13px;
}
.bg-green-50 {
  background-color: #f1fff4;
}
.bg-red-50 {
  background-color: #fff5f5;
}
</style>
