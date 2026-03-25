<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue';
import type { UpdateUserRequest } from 'src/models/user';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/auth-store';
import { useUserStore } from 'src/stores/user-store';
import { useCourseStore } from 'src/stores/course-store';
import { api } from 'src/boot/axios';
import { useQuasar } from 'quasar';
import { generateCertificate } from 'src/utils/generateCertificate';

const router = useRouter();
const authStore = useAuthStore();
const userStore = useUserStore();
const store = useCourseStore();
const $q = useQuasar();
const tab = ref('history');

const enrolledCourses = computed(() => store.enrolledCourses);

// ─── Certificates ──────────────────────────────────────────────────────────────

interface MyCertificate {
  id: number;
  certificateCode: string;
  courseTitle: string;
  projectName: string;
  duration: string;
  dateIssued: string | null;
  participantName: string;
  templateImage: string | null; // Base64 template stored on the certificate
}

const certificates = ref<MyCertificate[]>([]);
const isLoadingCerts = ref(false);

onMounted(async () => {
  await store.fetchEnrolledCourses();
  await loadCertificates();
  initProfileForm();
});

const loadCertificates = async () => {
  const userId = userStore.profile?.id;
  if (!userId) return;

  isLoadingCerts.value = true;
  try {
    const res = await api.get(`/certificates/user/${userId}`);
    certificates.value = (res.data as any[])
      .filter((c) => c.status === 'passed')
      .map((c) => ({
        id: c.id,
        certificateCode: c.certificateCode || '-',
        courseTitle: c.registration?.project?.course?.title || 'ไม่ระบุหลักสูตร',
        projectName: c.registration?.project?.name || '-',
        duration: c.registration?.project?.course?.duration_hours
          ? `${c.registration.project.course.duration_hours} ชั่วโมง`
          : '-',
        dateIssued: c.issueDate
          ? new Date(c.issueDate).toLocaleDateString('th-TH', {
              timeZone: 'Asia/Bangkok',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })
          : null,
        participantName: c.registration?.user
          ? `${c.registration.user.firstName} ${c.registration.user.lastName}`.trim()
          : `${userStore.profile?.firstName || ''} ${userStore.profile?.lastName || ''}`.trim(),
        templateImage: c.certificateImage || null,
      }));
  } catch (err) {
    console.error('Failed to load certificates', err);
  } finally {
    isLoadingCerts.value = false;
  }
};

// ─── Certificate Generation ────────────────────────────────────────────────────

const toCertData = (cert: MyCertificate) => ({
  participantName: cert.participantName,
  courseTitle: cert.courseTitle,
  duration: cert.duration,
  dateIssued: cert.dateIssued,
  certificateCode: cert.certificateCode !== '-' ? cert.certificateCode : null,
});

// ─── Preview Dialog ────────────────────────────────────────────────────────────

const previewDialog = ref(false);
const previewCert = ref<MyCertificate | null>(null);
const previewImageUrl = ref('');
const isGenerating = ref(false);

const openPreview = async (cert: MyCertificate) => {
  previewCert.value = cert;
  previewImageUrl.value = '';
  previewDialog.value = true;
  isGenerating.value = true;
  try {
    previewImageUrl.value = await generateCertificate(toCertData(cert));
  } catch {
    $q.notify({ type: 'negative', message: 'ไม่สามารถสร้างวุฒิบัตรได้', position: 'top' });
    previewDialog.value = false;
  } finally {
    isGenerating.value = false;
  }
};

const downloadCertificate = async (cert: MyCertificate) => {
  try {
    const dataUrl =
      previewCert.value?.id === cert.id && previewImageUrl.value
        ? previewImageUrl.value
        : await generateCertificate(toCertData(cert));
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `certificate_${cert.certificateCode}.jpg`;
    a.click();
  } catch {
    $q.notify({ type: 'negative', message: 'ไม่สามารถดาวน์โหลดได้', position: 'top' });
  }
};

// ─── Training History helpers ──────────────────────────────────────────────────

const getStatusColor = (code: string) => {
  switch (code) {
    case 'registered':
      return 'blue-1 text-blue-9';
    case 'waiting':
      return 'orange-1 text-orange-9';
    case 'confirmed':
      return 'green-1 text-green-9';
    case 'cancelled':
      return 'grey-2 text-grey-8';
    default:
      return 'grey-2 text-grey-8';
  }
};

const showCancelDialog = ref(false);
const courseToCancel = ref<number | null>(null);

const promptCancel = (id: number) => {
  courseToCancel.value = id;
  showCancelDialog.value = true;
};

const executeCancel = async () => {
  showCancelDialog.value = false;
  const dismiss = $q.notify({
    spinner: true,
    message: 'กำลังยกเลิกการลงทะเบียน...',
    color: 'primary',
    timeout: 0,
  });
  try {
    if (courseToCancel.value !== null) await store.cancelEnrollment(courseToCancel.value);
    dismiss();
    $q.notify({
      message: 'ยกเลิกการลงทะเบียนสำเร็จ ระบบได้เลื่อนคิวสำรองถัดไปแล้ว',
      color: 'positive',
      icon: 'check_circle',
      position: 'top',
    });
  } catch {
    dismiss();
    $q.notify({ message: 'เกิดข้อผิดพลาดในการยกเลิก', color: 'negative', position: 'top' });
  }
};

const confirmAttendance = async (id: number) => {
  const dismiss = $q.notify({
    spinner: true,
    message: 'กำลังยืนยันการเข้าร่วม...',
    color: 'primary',
    timeout: 0,
  });
  try {
    await store.confirmEnrollmentAttendance(id);
    dismiss();
    $q.notify({
      message: 'ยืนยันการเข้าร่วมอบรมสำเร็จ',
      color: 'positive',
      icon: 'check_circle',
      position: 'top',
    });
  } catch {
    dismiss();
    $q.notify({ message: 'เกิดข้อผิดพลาดในการยืนยัน', color: 'negative', position: 'top' });
  }
};

// ─── Personal Information ──────────────────────────────────────────────────────

const profileForm = reactive({
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  department: '',
  address: '',
  province: '',
  zipcode: '',
});

const initProfileForm = () => {
  const p = userStore.profile;
  if (!p) return;
  profileForm.firstName = p.firstName || '';
  profileForm.lastName = p.lastName || '';
  profileForm.phone = p.phone || '';
  profileForm.email = p.email || '';
  profileForm.department = p.department || '';
  profileForm.address = p.address || '';
  profileForm.province = p.province || '';
  profileForm.zipcode = p.zipcode || '';
};

watch(tab, (newTab) => {
  if (newTab === 'profile') initProfileForm();
});

const isSavingProfile = ref(false);

const saveProfile = async () => {
  if (!profileForm.firstName.trim() || !profileForm.lastName.trim()) {
    $q.notify({ message: 'กรุณากรอกชื่อและนามสกุล', color: 'warning', position: 'top' });
    return;
  }
  isSavingProfile.value = true;
  try {
    const payload: UpdateUserRequest = {
      firstName: profileForm.firstName.trim(),
      lastName: profileForm.lastName.trim(),
    };
    if (profileForm.phone) payload.phone = profileForm.phone;
    if (profileForm.email) payload.email = profileForm.email;
    if (profileForm.department) payload.department = profileForm.department;
    if (profileForm.address) payload.address = profileForm.address;
    if (profileForm.province) payload.province = profileForm.province;
    if (profileForm.zipcode) payload.zipcode = profileForm.zipcode;
    await userStore.updateProfile(payload);
    $q.notify({
      message: 'บันทึกข้อมูลส่วนตัวสำเร็จ',
      color: 'positive',
      icon: 'check_circle',
      position: 'top',
    });
  } catch {
    $q.notify({ message: 'เกิดข้อผิดพลาดในการบันทึก', color: 'negative', position: 'top' });
  } finally {
    isSavingProfile.value = false;
  }
};

// ─── Favorite Courses ──────────────────────────────────────────────────────────

const favoriteCourses = computed(() =>
  store.courses.filter((c) => store.favoriteIds.includes(c.id)),
);

watch(tab, async (newTab) => {
  if (newTab === 'favorites' && store.courses.length === 0) {
    await store.fetchCourses();
  }
});

const removeFavorite = (courseId: number) => {
  store.toggleFavorite(courseId);
};
</script>

<template>
  <q-page class="bg-light-theme q-pb-xl">
    <div class="header-banner q-py-xl bg-dark text-white">
      <div class="container-width q-mx-auto q-px-md">
        <h1 class="text-h3 text-weight-bolder q-mt-none q-mb-sm">ข้อมูลส่วนตัวของฉัน</h1>
        <p class="text-subtitle1 text-grey-4">จัดการประวัติการฝึกอบรมและวุฒิบัตรของคุณ</p>
      </div>
    </div>

    <div class="container-width q-mx-auto q-px-md q-mt-lg">
      <q-card flat class="border-radius-20 overflow-hidden shadow-1">
        <q-tabs
          v-model="tab"
          dense
          class="text-grey-7 bg-white q-pt-sm"
          active-color="primary"
          indicator-color="primary"
          align="left"
          narrow-indicator
        >
          <q-tab
            name="profile"
            icon="person"
            label="ข้อมูลส่วนตัว"
            class="text-weight-bold q-px-lg"
          />
          <q-tab
            name="history"
            icon="history"
            label="ประวัติการอบรม"
            class="text-weight-bold q-px-lg"
          />
          <q-tab
            name="certificate"
            icon="workspace_premium"
            label="วุฒิบัตรของฉัน"
            class="text-weight-bold q-px-lg"
          >
            <q-badge v-if="certificates.length > 0" color="primary" floating>{{
              certificates.length
            }}</q-badge>
          </q-tab>
          <q-tab
            name="favorites"
            icon="favorite"
            label="หลักสูตรที่ชอบ"
            class="text-weight-bold q-px-lg"
          >
            <q-badge v-if="store.favoriteIds.length > 0" color="red-5" floating>{{
              store.favoriteIds.length
            }}</q-badge>
          </q-tab>
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="tab" animated class="bg-white">
          <!-- Personal Information Tab -->
          <q-tab-panel name="profile" class="q-pa-md q-pa-lg-xl">
            <div class="text-h6 text-weight-bold q-mb-lg">ข้อมูลส่วนตัว</div>

            <div class="row q-col-gutter-md" style="max-width: 680px">
              <!-- Avatar / Username info -->
              <div class="col-12 q-mb-sm">
                <div class="row items-center q-gutter-md">
                  <q-avatar size="72px" class="shadow-2">
                    <img
                      :src="
                        userStore.profile?.profilePicture ||
                        'https://cdn.quasar.dev/img/boy-avatar.png'
                      "
                    />
                  </q-avatar>
                  <div>
                    <div class="text-subtitle1 text-weight-bold text-dark">
                      {{ userStore.profile?.firstName }} {{ userStore.profile?.lastName }}
                    </div>
                    <div class="text-caption text-grey-6">@{{ userStore.profile?.username }}</div>
                    <q-chip
                      dense
                      size="sm"
                      :color="userStore.profile?.role === 'admin' ? 'deep-purple-2' : 'blue-1'"
                      :text-color="userStore.profile?.role === 'admin' ? 'deep-purple-9' : 'blue-9'"
                      class="q-mt-xs text-weight-bold"
                    >
                      {{
                        userStore.profile?.role === 'admin'
                          ? 'ผู้ดูแลระบบ'
                          : userStore.profile?.role === 'staff'
                            ? 'เจ้าหน้าที่'
                            : 'ผู้เข้าอบรม'
                      }}
                    </q-chip>
                  </div>
                </div>
              </div>

              <q-separator class="col-12 q-my-sm" />

              <!-- Form fields -->
              <div class="col-12 col-sm-6">
                <div class="text-caption text-weight-bold text-grey-7 q-mb-xs">
                  ชื่อ <span class="text-negative">*</span>
                </div>
                <q-input outlined dense v-model="profileForm.firstName" placeholder="ชื่อ" />
              </div>
              <div class="col-12 col-sm-6">
                <div class="text-caption text-weight-bold text-grey-7 q-mb-xs">
                  นามสกุล <span class="text-negative">*</span>
                </div>
                <q-input outlined dense v-model="profileForm.lastName" placeholder="นามสกุล" />
              </div>
              <div class="col-12 col-sm-6">
                <div class="text-caption text-weight-bold text-grey-7 q-mb-xs">เบอร์โทรศัพท์</div>
                <q-input outlined dense v-model="profileForm.phone" placeholder="0xx-xxx-xxxx">
                  <template #prepend><q-icon name="phone" size="16px" color="grey-5" /></template>
                </q-input>
              </div>
              <div class="col-12 col-sm-6">
                <div class="text-caption text-weight-bold text-grey-7 q-mb-xs">อีเมล</div>
                <q-input
                  outlined
                  dense
                  v-model="profileForm.email"
                  placeholder="example@email.com"
                  type="email"
                >
                  <template #prepend><q-icon name="email" size="16px" color="grey-5" /></template>
                </q-input>
              </div>
              <div class="col-12">
                <div class="text-caption text-weight-bold text-grey-7 q-mb-xs">
                  หน่วยงาน / องค์กร
                </div>
                <q-input outlined dense v-model="profileForm.department" placeholder="ชื่อหน่วยงาน">
                  <template #prepend
                    ><q-icon name="business" size="16px" color="grey-5"
                  /></template>
                </q-input>
              </div>
              <div class="col-12">
                <div class="text-caption text-weight-bold text-grey-7 q-mb-xs">ที่อยู่</div>
                <q-input
                  outlined
                  dense
                  v-model="profileForm.address"
                  placeholder="บ้านเลขที่ ถนน ตำบล อำเภอ"
                >
                  <template #prepend><q-icon name="home" size="16px" color="grey-5" /></template>
                </q-input>
              </div>
              <div class="col-12 col-sm-8">
                <div class="text-caption text-weight-bold text-grey-7 q-mb-xs">จังหวัด</div>
                <q-input outlined dense v-model="profileForm.province" placeholder="จังหวัด" />
              </div>
              <div class="col-12 col-sm-4">
                <div class="text-caption text-weight-bold text-grey-7 q-mb-xs">รหัสไปรษณีย์</div>
                <q-input
                  outlined
                  dense
                  v-model="profileForm.zipcode"
                  placeholder="xxxxx"
                  maxlength="5"
                />
              </div>

              <div class="col-12 q-mt-sm">
                <q-btn
                  unelevated
                  color="primary"
                  icon="save"
                  label="บันทึกข้อมูล"
                  no-caps
                  class="text-weight-bold q-px-xl"
                  :loading="isSavingProfile"
                  @click="saveProfile"
                />
              </div>
            </div>
          </q-tab-panel>

          <!-- Training History Tab -->
          <q-tab-panel name="history" class="q-pa-md q-pa-lg-xl">
            <div class="text-h6 text-weight-bold q-mb-lg">หลักสูตรที่ลงทะเบียนแล้ว</div>

            <div class="row q-col-gutter-lg">
              <div v-for="course in enrolledCourses" :key="course.id" class="col-12 col-md-6">
                <q-card bordered flat class="border-radius-16 h-100 column">
                  <div class="row no-wrap flex-grow-1">
                    <q-img :src="course.image" style="width: 140px; min-height: 100%" fit="cover" />
                    <q-card-section class="col column justify-center q-pa-md">
                      <q-chip
                        size="sm"
                        :class="getStatusColor(course.statusCode)"
                        class="q-mb-sm text-weight-bold q-px-sm"
                        style="width: fit-content; margin-left: 0"
                      >
                        {{ course.status }}
                      </q-chip>
                      <div
                        class="text-subtitle1 text-weight-bold line-height-tight q-mb-xs ellipsis-2-lines"
                      >
                        {{ course.title }}
                      </div>
                      <div class="text-caption text-grey-6 flex items-center q-mb-xs">
                        <q-icon name="event" class="q-mr-xs" /> {{ course.date }}
                      </div>
                      <div
                        v-if="course.isWaitingList"
                        class="text-caption text-orange-8 flex items-center q-mb-sm"
                      >
                        <q-icon name="hourglass_empty" size="13px" class="q-mr-xs" />
                        อยู่ในคิวสำรอง รอที่นั่งว่าง
                      </div>
                    </q-card-section>
                  </div>

                  <q-separator />

                  <q-card-actions align="right" class="q-px-md q-py-sm bg-grey-1">
                    <q-btn
                      v-if="course.canCancel"
                      flat
                      color="negative"
                      label="ยกเลิกสิทธิ์"
                      no-caps
                      class="text-weight-bold"
                      @click="promptCancel(course.id)"
                    />
                    <q-btn
                      v-if="course.canConfirm"
                      unelevated
                      color="positive"
                      icon="check_circle"
                      label="ยืนยันเข้าร่วม"
                      no-caps
                      class="text-weight-bold q-px-md q-ml-sm"
                      @click="confirmAttendance(course.id)"
                    />
                    <q-btn
                      v-if="course.statusCode === 'confirmed'"
                      unelevated
                      color="positive"
                      icon="visibility"
                      label="ดูรายละเอียด"
                      no-caps
                      class="text-weight-bold q-px-md q-ml-sm"
                      @click="router.push(`/courses/${course.courseId}`)"
                    />
                  </q-card-actions>
                </q-card>
              </div>
            </div>

            <div v-if="enrolledCourses.length === 0" class="text-center q-py-xl text-grey-6">
              <q-icon name="inbox" size="64px" class="q-mb-md opacity-50" />
              <div class="text-h6">ยังไม่มีประวัติการลงทะเบียน</div>
              <q-btn
                outline
                color="primary"
                label="ค้นหาหลักสูตร"
                class="q-mt-md rounded-borders text-weight-bold"
                to="/courses/all"
              />
            </div>
          </q-tab-panel>

          <!-- My Certificates Tab -->
          <q-tab-panel name="certificate" class="q-pa-md q-pa-lg-xl">
            <div class="text-h6 text-weight-bold q-mb-lg">วุฒิบัตรที่ได้รับ</div>

            <div v-if="isLoadingCerts" class="text-center q-py-xl">
              <q-spinner-dots color="primary" size="48px" />
            </div>

            <div v-else-if="certificates.length > 0" class="row q-col-gutter-md">
              <div v-for="cert in certificates" :key="cert.id" class="col-12 col-sm-6 col-md-4">
                <q-card bordered flat class="border-radius-16 certificate-card">
                  <!-- Certificate preview thumbnail -->
                  <div
                    class="certificate-thumb relative-position flex flex-center"
                    style="
                      height: 130px;
                      border-radius: 16px 16px 0 0;
                      background: linear-gradient(135deg, #1a237e, #3949ab);
                      cursor: pointer;
                    "
                    @click="openPreview(cert)"
                  >
                    <div class="text-center text-white">
                      <q-icon name="workspace_premium" size="44px" style="opacity: 0.9" />
                      <div class="text-caption q-mt-xs" style="opacity: 0.8; letter-spacing: 1px">
                        CERTIFICATE
                      </div>
                    </div>
                    <div
                      class="absolute-full flex flex-center"
                      style="background: rgba(0, 0, 0, 0); transition: background 0.2s"
                      @mouseenter="
                        ($event.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.2)'
                      "
                      @mouseleave="
                        ($event.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0)'
                      "
                    >
                      <div class="text-white text-center" style="opacity: 0">
                        <q-icon name="preview" size="28px" />
                        <div class="text-caption q-mt-xs">คลิกเพื่อดูตัวอย่าง</div>
                      </div>
                    </div>
                  </div>

                  <q-card-section class="q-pa-md">
                    <div
                      class="text-subtitle2 text-weight-bold ellipsis-2-lines q-mb-xs"
                      style="min-height: 40px"
                    >
                      {{ cert.courseTitle }}
                    </div>
                    <div class="text-caption text-grey-7 q-mb-xs">
                      <q-icon name="folder" size="12px" class="q-mr-xs" />{{ cert.projectName }}
                    </div>
                    <div class="text-caption text-grey-6 q-mb-xs">
                      <q-icon name="schedule" size="12px" class="q-mr-xs" />{{ cert.duration }}
                    </div>
                    <div v-if="cert.dateIssued" class="text-caption text-grey-6 q-mb-xs">
                      <q-icon name="event" size="12px" class="q-mr-xs" />{{ cert.dateIssued }}
                    </div>
                    <div class="text-caption text-grey-5 q-mb-md">
                      <q-icon name="tag" size="12px" class="q-mr-xs" />{{ cert.certificateCode }}
                    </div>

                    <div class="row q-gutter-xs">
                      <q-btn
                        unelevated
                        color="purple-2"
                        text-color="purple-9"
                        icon="preview"
                        label="ดูตัวอย่าง"
                        class="col text-weight-bold"
                        no-caps
                        @click="openPreview(cert)"
                      />
                      <q-btn
                        unelevated
                        color="primary"
                        text-color="white"
                        icon="download"
                        label="ดาวน์โหลด"
                        class="col text-weight-bold"
                        no-caps
                        @click="downloadCertificate(cert)"
                      />
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>

            <div v-else class="text-center q-py-xl text-grey-6">
              <q-icon name="workspace_premium" size="64px" class="q-mb-md opacity-50" />
              <div class="text-h6">ยังไม่มีวุฒิบัตรในขณะนี้</div>
              <div class="text-caption q-mt-sm">
                คุณจะได้รับวุฒิบัตรเมื่อเข้าร่วมอบรมและผ่านการประเมินครบถ้วน
              </div>
            </div>
          </q-tab-panel>

          <!-- Favorite Courses Tab -->
          <q-tab-panel name="favorites" class="q-pa-md q-pa-lg-xl">
            <div class="text-h6 text-weight-bold q-mb-lg">หลักสูตรที่ชอบ</div>

            <div v-if="store.isLoading" class="text-center q-py-xl">
              <q-spinner-dots color="primary" size="48px" />
            </div>

            <div v-else-if="favoriteCourses.length === 0" class="text-center q-py-xl text-grey-6">
              <q-icon name="favorite_border" size="64px" class="q-mb-md opacity-50" />
              <div class="text-h6">ยังไม่มีหลักสูตรที่ชอบ</div>
              <div class="text-caption q-mt-sm q-mb-md">
                กดไอคอนหัวใจที่หน้าหลักสูตรเพื่อเพิ่มที่นี่
              </div>
              <q-btn
                outline
                color="primary"
                label="ค้นหาหลักสูตร"
                class="rounded-borders text-weight-bold"
                to="/courses/all"
              />
            </div>

            <div v-else class="row q-col-gutter-lg">
              <div
                v-for="course in favoriteCourses"
                :key="course.id"
                class="col-12 col-md-6 col-lg-4"
              >
                <q-card bordered flat class="border-radius-16 favorite-card column">
                  <q-img
                    :src="course.image || 'https://cdn.quasar.dev/img/parallax2.jpg'"
                    :ratio="16 / 9"
                    style="border-radius: 16px 16px 0 0"
                  >
                    <div class="absolute-top-right q-pa-sm">
                      <q-btn
                        round
                        unelevated
                        size="sm"
                        color="red-1"
                        text-color="red-7"
                        icon="favorite"
                        @click="removeFavorite(course.id)"
                      >
                        <q-tooltip>นำออกจากรายการชอบ</q-tooltip>
                      </q-btn>
                    </div>
                  </q-img>

                  <q-card-section class="col column justify-between q-pa-md">
                    <div>
                      <div
                        class="text-subtitle1 text-weight-bold line-height-tight q-mb-sm ellipsis-2-lines"
                      >
                        {{ course.title }}
                      </div>
                      <div class="text-caption text-grey-6 flex items-center q-mb-xs">
                        <q-icon name="event" size="13px" class="q-mr-xs" /> {{ course.date }}
                      </div>
                      <div class="text-caption text-grey-6 flex items-center q-mb-xs">
                        <q-icon name="location_on" size="13px" class="q-mr-xs" />
                        {{ course.location }}
                      </div>
                      <div class="text-caption text-grey-6 flex items-center q-mb-md">
                        <q-icon name="schedule" size="13px" class="q-mr-xs" /> {{ course.duration }}
                      </div>
                    </div>
                    <div class="row items-center justify-between">
                      <q-chip
                        dense
                        size="sm"
                        :color="course.price === 0 ? 'green-1' : 'blue-1'"
                        :text-color="course.price === 0 ? 'green-8' : 'blue-8'"
                        class="text-weight-bold"
                      >
                        {{ course.price === 0 ? 'ฟรี' : `${course.price.toLocaleString()} บาท` }}
                      </q-chip>
                      <q-btn
                        unelevated
                        size="sm"
                        color="primary"
                        label="ดูรายละเอียด"
                        no-caps
                        class="text-weight-bold q-px-md"
                        :to="`/courses/${course.id}`"
                      />
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </q-card>
    </div>

    <!-- Cancel Confirmation Dialog -->
    <q-dialog v-model="showCancelDialog" persistent>
      <q-card class="q-pa-md border-radius-16" style="max-width: 400px; width: 100%">
        <q-card-section class="text-center q-pb-none">
          <q-icon name="cancel" size="64px" color="negative" class="q-mb-md" />
          <div class="text-h6 text-weight-bold text-dark line-height-tight q-mb-sm">
            ยืนยันการยกเลิกสิทธิ์?
          </div>
          <div class="text-body1 text-grey-8 q-mb-md">
            หากท่านยกเลิก ระบบจะคืนสิทธิ์ให้ผู้ที่อยู่ในคิวสำรองลำดับถัดไปทันที
          </div>
        </q-card-section>
        <q-card-actions align="center" class="q-pt-md q-pb-sm">
          <q-btn
            unelevated
            color="negative"
            label="ยืนยันการยกเลิก"
            class="text-weight-bold q-px-md"
            @click="executeCancel"
          />
          <q-btn
            flat
            color="grey-7"
            label="ปิดหน้าต่าง"
            class="text-weight-bold q-ml-sm"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Certificate Preview Dialog -->
    <q-dialog v-model="previewDialog" maximized>
      <q-card>
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-weight-bold">วุฒิบัตร — {{ previewCert?.courseTitle }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="flex flex-center" style="min-height: 70vh">
          <q-spinner-dots v-if="isGenerating" color="primary" size="60px" />
          <div v-else-if="previewImageUrl" class="column items-center q-gutter-md">
            <img
              :src="previewImageUrl"
              alt="Certificate"
              style="
                max-width: 100%;
                max-height: 75vh;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
              "
            />
            <div class="row q-gutter-md">
              <q-btn
                unelevated
                color="deep-orange"
                text-color="white"
                icon="download"
                label="ดาวน์โหลดวุฒิบัตร"
                no-caps
                @click="downloadCertificate(previewCert!)"
              />
              <q-btn flat label="ปิด" v-close-popup />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<style scoped>
.bg-light-theme {
  background-color: #f1f5f9;
  min-height: 100vh;
}
.container-width {
  max-width: 1200px;
  width: 100%;
}
.border-radius-20 {
  border-radius: 20px;
}
.border-radius-16 {
  border-radius: 16px;
}
.line-height-tight {
  line-height: 1.3;
}
.h-100 {
  height: 100%;
}
.flex-grow-1 {
  flex-grow: 1;
}

.certificate-card {
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}
.certificate-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.favorite-card {
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}
.favorite-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.certificate-thumb:hover img {
  opacity: 1;
  transition: opacity 0.2s ease;
}
</style>
