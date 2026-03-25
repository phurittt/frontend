<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { useCertificateStore } from 'src/stores/certificate-store';

const $q = useQuasar();
const certificateStore = useCertificateStore();
const certCode = ref('');
const isVerifying = ref(false);
const verifyResult = ref<any>(null);
const verifyError = ref('');

const showImageMenu = ref(false);
let hideTimer: any = null;

const onMouseEnter = () => {
  clearTimeout(hideTimer);
  showImageMenu.value = true;
};

const onMouseLeave = () => {
  hideTimer = setTimeout(() => {
    showImageMenu.value = false;
  }, 200);
};

const verifyCode = async () => {
  if (!certCode.value.trim()) {
    $q.notify({
      message: 'กรุณากรอกรหัส Code ก่อนทำการตรวจสอบ',
      color: 'warning',
      icon: 'warning',
      position: 'top',
    });
    return;
  }
  isVerifying.value = true;
  verifyResult.value = null;
  verifyError.value = '';
  try {
    verifyResult.value = await certificateStore.verifyCertificate(certCode.value.trim());
  } catch {
    verifyError.value = 'ไม่พบวุฒิบัตรที่มีรหัสนี้ หรือรหัสไม่ถูกต้อง';
  } finally {
    isVerifying.value = false;
  }
};
</script>

<template>
  <div class="q-pa-md flex flex-center bg-light-theme">
    <q-card flat class="verify-card q-pa-xl text-center bg-white">
      <q-avatar size="80px" color="orange-1" text-color="orange-7" class="q-mb-md shadow-1">
        <q-icon name="workspace_premium" size="40px" />
      </q-avatar>

      <h2 class="text-h4 text-weight-bolder text-dark q-mt-none q-mb-sm">ตรวจสอบวุฒิบัตร</h2>
      <p class="text-grey-6 text-subtitle1 q-mb-xl">
        กรุณากรอกรหัสอ้างอิง (Code) เพื่อตรวจสอบข้อมูลการผ่านการอบรม
      </p>

      <div class="row q-col-gutter-md items-start justify-center">
        <div class="col-12 col-sm-8">
          <q-input
            v-model="certCode"
            outlined
            placeholder="ระบุรหัส CODE *"
            bg-color="grey-1"
            color="primary"
            class="verify-input text-body1"
          >
            <template v-slot:append>
              <q-icon
                name="info"
                color="grey-5"
                class="cursor-pointer hover-scale"
                @mouseenter="onMouseEnter"
                @mouseleave="onMouseLeave"
              >
                <q-menu
                  v-model="showImageMenu"
                  anchor="top middle"
                  self="bottom middle"
                  :offset="[0, 8]"
                  class="bg-white q-pa-xs shadow-3"
                  @mouseenter="onMouseEnter"
                  @mouseleave="onMouseLeave"
                >
                  <img
                    src="https://training.buu.ac.th/public/frontend/images/educate/icon/certificatecode.jpg"
                    alt="ตัวอย่างตำแหน่งรหัสอ้างอิง"
                    style="width: 250px; display: block; max-width: 100%; border-radius: 4px"
                  />
                </q-menu>
              </q-icon>
            </template>
          </q-input>
        </div>

        <div class="col-12 col-sm-4">
          <q-btn
            unelevated
            color="pink-6"
            label="ตรวจสอบ"
            icon="check_circle_outline"
            class="full-width text-weight-bold text-subtitle1 verify-btn"
            :loading="isVerifying"
            @click="verifyCode"
          />
        </div>
      </div>

      <!-- Success Result -->
      <transition name="fade">
        <q-card
          v-if="verifyResult"
          flat
          bordered
          class="q-mt-xl text-left"
          style="border-radius: 16px; border-color: #4caf50"
        >
          <q-card-section>
            <div class="row items-center q-mb-md">
              <q-avatar color="green-1" text-color="green-8" size="48px">
                <q-icon name="verified" size="28px" />
              </q-avatar>
              <div class="q-ml-md">
                <div class="text-h6 text-green-8 text-weight-bold">วุฒิบัตรถูกต้อง</div>
                <div class="text-caption text-grey-6">ระบบยืนยันว่าวุฒิบัตรนี้ออกโดยระบบ TMIS</div>
              </div>
            </div>
            <q-separator class="q-mb-md" />
            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6">
                <div class="text-caption text-grey-6">ชื่อ-นามสกุล</div>
                <div class="text-body1 text-weight-bold">{{ verifyResult.participantName }}</div>
              </div>
              <div class="col-12 col-sm-6">
                <div class="text-caption text-grey-6">รหัสวุฒิบัตร</div>
                <div class="text-body1 text-weight-bold text-primary">
                  {{ verifyResult.certificateCode }}
                </div>
              </div>
              <div class="col-12">
                <div class="text-caption text-grey-6">หลักสูตร</div>
                <div class="text-body1 text-weight-bold">{{ verifyResult.courseName }}</div>
              </div>
              <div class="col-12 col-sm-6">
                <div class="text-caption text-grey-6">โครงการ</div>
                <div class="text-body1">{{ verifyResult.projectName }}</div>
              </div>
              <div class="col-12 col-sm-6">
                <div class="text-caption text-grey-6">ระยะเวลา</div>
                <div class="text-body1">{{ verifyResult.duration }}</div>
              </div>
              <div class="col-12 col-sm-6" v-if="verifyResult.issueDate">
                <div class="text-caption text-grey-6">วันที่ออกวุฒิบัตร</div>
                <div class="text-body1">
                  {{
                    new Date(verifyResult.issueDate).toLocaleDateString('th-TH', {
                      timeZone: 'Asia/Bangkok',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  }}
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </transition>

      <!-- Error Result -->
      <transition name="fade">
        <q-banner
          v-if="verifyError"
          class="q-mt-xl text-white bg-negative"
          style="border-radius: 12px"
          rounded
        >
          <template v-slot:avatar>
            <q-icon name="cancel" color="white" />
          </template>
          {{ verifyError }}
        </q-banner>
      </transition>
    </q-card>
  </div>
</template>

<style scoped lang="scss">
.bg-light-theme {
  background-color: #f8fafc;
  min-height: 400px;
}

.verify-card {
  width: 100%;
  max-width: 700px;
  border-radius: 24px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.03);
}

.verify-input :deep(.q-field__control) {
  border-radius: 12px;
  height: 56px;
  transition: all 0.3s ease;
}

.verify-input :deep(.q-field__control:hover) {
  border-color: #cbd5e1;
}

.verify-btn {
  border-radius: 12px;
  height: 56px;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(233, 30, 99, 0.3);
  }
}

.hover-scale {
  transition: transform 0.2s ease;
  &:hover {
    transform: scale(1.1);
    color: #000 !important;
  }
}

@media (max-width: 600px) {
  .verify-card {
    padding: 32px 20px !important;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
