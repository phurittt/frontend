<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from 'src/stores/user-store';
import { type QInput } from 'quasar';

interface LoginInstruction {
  title: string;
  desc: string;
}

const instructions: LoginInstruction[] = [
  {
    title: 'สำหรับนักศึกษาและบุคลากรมหาวิทยาลัย:',
    desc: 'ใช้ชื่อผู้ใช้และรหัสผ่านเดียวกับระบบ Email มหาวิทยาลัย',
  },
  {
    title: 'สำหรับบุคคลภายนอก:',
    desc: 'กรุณาสมัครสมาชิกก่อนเข้าใช้งานระบบ โดยคลิกที่ลิงก์ "สมัครสมาชิก" ด้านล่าง',
  },
  {
    title: 'หากมีปัญหาในการเข้าสู่ระบบ:',
    desc: 'กรุณาติดต่อเจ้าหน้าที่ผ่านช่องทาง "ติดต่อเรา" หรือโทร 02-123-4567',
  },
  {
    title: 'ข้อมูลส่วนบุคคล:',
    desc: 'ระบบจะเก็บข้อมูลการเข้าใช้งานเพื่อการปรับปรุงบริการและการออกใบรับรองหลักสูตร',
  },
];

const router = useRouter();
const store = useUserStore();

// Form Data
const username = ref('');
const password = ref('');
const usernameRef = ref<QInput | null>(null);
const passwordRef = ref<QInput | null>(null);
const usernameRules = [(val: string) => (val && val.length > 0) || 'กรุณากรอกชื่อผู้ใช้'];
const passwordRules = [(val: string) => (val && val.length > 0) || 'กรุณากรอกรหัสผ่าน'];

// UI State
const isPassword = ref(true); // Toggle ซ่อน/แสดงรหัสผ่าน
const loading = ref(false); // แสดงสถานะ Loading ขณะกดปุ่ม

const shakeTrigger = ref(false);

// ถ้า password กลายเป็นค่าว่าง ให้บังคับซ่อนรหัสทันที
watch(password, (newVal) => {
  if (!newVal) {
    isPassword.value = true;
  }
});

const handleLogin = async () => {
  const isUsernameValid = await usernameRef.value?.validate();
  const isPasswordValid = await passwordRef.value?.validate();

  if (!isUsernameValid || !isPasswordValid) {
    shakeTrigger.value = true;

    setTimeout(() => {
      shakeTrigger.value = false;
    }, 400);

    setTimeout(() => {
      if (!isUsernameValid) {
        usernameRef.value?.focus();
      } else if (!isPasswordValid) {
        passwordRef.value?.focus();
      }
    }, 500);

    return;
  }

  loading.value = true;
  try {
    await store.login(username.value);
    router.push('/');
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <q-page class="flex flex-center">
    <div class="container-width row q-col-gutter-xl items-center">
      <div class="col-12 col-md-7 text-dark">
        <h2 class="text-h4 text-weight-bolder text-negative q-mb-xl">
          การเข้าสู่ระบบเพื่อลงทะเบียนอบรม
        </h2>

        <div v-for="(item, index) in instructions" :key="index" class="row no-wrap q-mb-sm">
          <div class="col-auto text-weight-bolder q-mr-md text-negative text-subtitle1">
            {{ index + 1 }}.
          </div>
          <div class="col">
            <div class="text-weight-medium text-dark text-subtitle1">{{ item.title }}</div>
            <div class="text-grey-8 text-subtitle1">{{ item.desc }}</div>
          </div>
        </div>

        <q-banner
          class="bg-blue-1 text-blue-9 q-mt-xl rounded-borders q-pa-md"
          style="border-left: 5px solid #29b6f6"
        >
          <template v-slot:avatar>
            <q-icon name="info" size="sm" />
          </template>
          <div class="text-weight-bold">หมายเหตุ:</div>
          <div class="text-body2">
            การลงทะเบียนเรียนจะสมบูรณ์เมื่อได้รับการยืนยันจากระบบ
            และจะได้รับอีเมลแจ้งรายละเอียดการอบรม
          </div>
        </q-banner>
      </div>

      <div class="col-12 col-md-5">
        <q-card class="text-white shadow-24" style="border-radius: 12px; background-color: #424242">
          <q-card-section class="text-center q-pt-xl q-pb-md">
            <div class="text-h5 text-weight-bolder">เข้าสู่ระบบ</div>
          </q-card-section>

          <q-form @submit.prevent="handleLogin">
            <q-card-section class="q-px-xl q-py-md">
              <div class="q-mb-md">
                <label for="username" class="text-subtitle2 text-grey-4 q-mb-xs block"
                  >ชื่อผู้ใช้ (Username)</label
                >
                <q-input
                  id="username"
                  for="username"
                  ref="usernameRef"
                  v-model="username"
                  autocomplete="username"
                  :class="{ 'shake-now': shakeTrigger && !username }"
                  :rules="usernameRules"
                  lazy-rules
                  outlined
                  placeholder=""
                  dense
                  bottom-slots
                  @update:model-value="usernameRef?.resetValidation()"
                />
              </div>

              <div class="q-mb-sm">
                <label for="password" class="text-subtitle2 text-grey-4 q-mb-xs block"
                  >รหัสผ่าน (Password)</label
                >
                <q-input
                  id="password"
                  for="password"
                  ref="passwordRef"
                  v-model="password"
                  autocomplete="current-password"
                  :class="{ 'shake-now': shakeTrigger && !password }"
                  :rules="passwordRules"
                  lazy-rules
                  outlined
                  :type="isPassword ? 'password' : 'text'"
                  placeholder=""
                  dense
                  bottom-slots
                  @update:model-value="passwordRef?.resetValidation()"
                >
                  <template v-slot:append>
                    <q-icon
                      v-if="password"
                      :name="isPassword ? 'visibility_off' : 'visibility'"
                      class="cursor-pointer"
                      @click="isPassword = !isPassword"
                    />
                  </template>
                </q-input>
              </div>

              <div class="row justify-between q-mt-md">
                <a href="#" class="auth-link q-ml-sm">สมัครสมาชิก (Register)</a>
                <a href="#" class="auth-link q-mr-sm">ลืมรหัสผ่าน?</a>
              </div>
            </q-card-section>

            <q-card-section class="q-px-xl q-pb-xl">
              <q-btn
                type="submit"
                label="SIGN IN"
                class="full-width q-py-sm text-weight-bold q-mb-lg"
                unelevated
                rounded
                no-caps
                :loading="loading"
                @click="handleLogin"
                style="background-color: #e91e63; height: 50px"
              />

              <div class="row items-center q-mb-lg">
                <q-separator dark class="col" style="background: rgba(255, 255, 255, 0.1)" />
                <div class="q-px-md text-grey-5 text-caption text-weight-medium">
                  หรือเข้าสู่ระบบด้วย
                </div>
                <q-separator dark class="col" style="background: rgba(255, 255, 255, 0.1)" />
              </div>

              <div class="row q-col-gutter-md justify-center">
                <div class="row justify-center btn-social">
                  <q-btn type="button" unelevated round no-caps class="btn-google full-width">
                    <img src="../assets/Google.svg" class="social-icon" />
                  </q-btn>
                </div>

                <div class="row justify-center btn-social">
                  <q-btn type="button" unelevated round no-caps class="btn-thaid full-width">
                    <img src="../assets/ThaID.png" class="social-icon" />
                  </q-btn>
                </div>
              </div>
            </q-card-section>
          </q-form>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<style scoped>
:deep(.shake-now .q-field__messages) {
  animation: error-shake 0.4s ease;
}
:deep(.q-field__messages) {
  transition: none !important;
  opacity: 1 !important;
}
:deep(.q-field--outlined .q-field__control) {
  background-color: #faf8f6 !important;
  border-radius: 4px;
  border: 1px solid #d1d5db !important;
  transition:
    border-color 0.3s ease,
    border-width 0.1s ease !important;
}
:deep(.q-field--outlined .q-field__control:before),
:deep(.q-field--outlined .q-field__control:after) {
  content: none !important;
  display: none !important;
}
:deep(.q-field--outlined .q-field__control:hover) {
  border-color: #4f46e5 !important;
  border-width: 1px !important;
  box-shadow: 0 0 0 1.5px #4f46e5 !important;
}
:deep(.q-field--focused .q-field__control) {
  border-color: #4f46e5 !important;
  border-width: 1px !important;
  box-shadow:
    0 0 0 1.5px #4f46e5,
    0 0 0 3px rgba(79, 70, 229, 0.1) !important;
}
:deep(.q-field__bottom) {
  background-color: transparent !important;
}

.container-width {
  max-width: 1200px;
  width: 100%;
}
.auth-link {
  color: #bdbdbd;
  text-decoration: none;
  font-size: 0.875rem;
  transition: color 0.3s ease;
}
.auth-link:hover {
  color: #ffffff;
  text-decoration: underline;
}

.block {
  display: block;
}

:deep(.btn-social .q-btn__content) {
  gap: 2px !important;
}
:deep(.btn-social .q-focus-helper) {
  display: none !important;
}
.btn-social {
  height: 48px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) !important;
  cursor: pointer;
}
.btn-google:hover,
.btn-thaid:hover {
  transform: translateY(-2px);
}
.btn-google {
  background-color: #f1f1f1 !important;
  color: #333 !important;
}
.btn-google:hover {
  background-color: #f1f1f1 !important;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1) !important;
}
.btn-thaid {
  background-color: #030650 !important;
}
.btn-thaid:hover {
  background-color: #030650 !important;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1) !important;
}
.social-icon {
  width: 32px;
  height: 20px;
}
.btn-thaid .social-icon {
  height: 32px;
  border-radius: 4px;
}
</style>
