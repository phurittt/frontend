<script setup lang="ts">
import { onUnmounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { type QInput } from 'quasar';
import { useAuthStore } from 'src/stores/auth-store';
import { useTokenClient } from 'vue3-google-signin';

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
const authStore = useAuthStore();

// Form Data
const username = ref('');
const password = ref('');
const usernameRef = ref<QInput | null>(null);
const passwordRef = ref<QInput | null>(null);
const usernameRules = [(val: string) => (val && val.length > 0) || 'กรุณากรอกชื่อผู้ใช้'];
const passwordRules = [(val: string) => (val && val.length > 0) || 'กรุณากรอกรหัสผ่าน'];

// UI State
const isPassword = ref(true); // Toggle ซ่อน/แสดงรหัสผ่าน
const signinLoading = ref(false);
const googleLoading = ref(false);

const shakeTrigger = ref(false);

// ถ้า password กลายเป็นค่าว่าง ให้บังคับซ่อนรหัสทันที
watch(password, (newVal) => {
  if (!newVal) {
    isPassword.value = true;
  }
});

const clearError = (inputRef: QInput | null) => {
  if (inputRef?.hasError) {
    inputRef.resetValidation();
  }
};

const handleLogin = async () => {
  if (signinLoading.value) return;

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

  signinLoading.value = true;
  try {
    await authStore.login(username.value);
    router.push('/');
  } catch (error) {
    console.error('Login failed:', error);
  } finally {
    signinLoading.value = false;
  }
};

const { isReady, login } = useTokenClient({
  onSuccess: async (response) => {
    try {
      await authStore.loginWithGoogle(response.access_token);

      router.push('/');
    } catch (error) {
      console.error('Google Login Error:', error);
      googleLoading.value = false;
    }
  },
  onError: (error) => {
    console.error('Google Login Failed:', error);
    googleLoading.value = false;
  },
});

let focusListener: (() => void) | null = null;

const handleGoogleLogin = () => {
  if (isReady.value) {
    googleLoading.value = true;
    login();
  }

  const onFocus = () => {
    setTimeout(() => {
      if (googleLoading.value) {
        googleLoading.value = false;
      }
    }, 1000);

    // ลบ Event ออกเมื่อทำงานเสร็จ
    window.removeEventListener('focus', onFocus);
    focusListener = null;
  };

  focusListener = onFocus;
  window.addEventListener('focus', onFocus);
};

onUnmounted(() => {
  if (focusListener) {
    window.removeEventListener('focus', focusListener);
  }
});
</script>

<template>
  <q-page class="flex flex-center">
    <div class="container-width row q-col-gutter-xl items-center q-mb-lg">
      <div class="col-12 col-md-7 text-dark">
        <h2 class="text-h4 text-weight-bolder text-negative q-mb-xl">
          การเข้าสู่ระบบเพื่อลงทะเบียนอบรม
        </h2>

        <div class="q-pl-sm border-left-indicator">
          <div
            v-for="(item, index) in instructions"
            :key="index"
            class="row no-wrap q-mb-md items-start"
          >
            <div class="col-auto q-mr-md q-pt-xs">
              <div class="number-badge flex flex-center text-weight-bold">
                {{ index + 1 }}
              </div>
            </div>
            <div class="col">
              <div class="text-weight-medium text-dark text-subtitle1">{{ item.title }}</div>
              <div class="text-grey-7 text-body2" style="line-height: 1.5">{{ item.desc }}</div>
            </div>
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
        <q-card class="login-card shadow-24">
          <q-card-section class="text-center q-pt-xl q-pb-md">
            <div class="text-h4 text-weight-bold">เข้าสู่ระบบ</div>
          </q-card-section>

          <q-form @submit.prevent="handleLogin">
            <q-card-section class="q-px-xl q-py-md">
              <div class="q-mb-md">
                <label for="username" class="block text-subtitle2 text-grey-4 q-mb-xs"
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
                  lazy-rules="ondemand"
                  outlined
                  placeholder=""
                  dense
                  bottom-slots
                  @update:model-value="clearError(usernameRef)"
                >
                  <template v-slot:prepend>
                    <q-icon name="person" size="xs" class="q-pr-xs icon-input" />
                  </template>
                </q-input>
              </div>

              <div class="q-mb-sm">
                <label for="password" class="block text-subtitle2 text-grey-4 q-mb-xs"
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
                  lazy-rules="ondemand"
                  outlined
                  :type="isPassword ? 'password' : 'text'"
                  placeholder=""
                  dense
                  bottom-slots
                  @update:model-value="clearError(passwordRef)"
                >
                  <template v-slot:prepend>
                    <q-icon name="lock" size="xs" class="q-pr-xs icon-input" />
                  </template>
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
                <router-link to="/register" class="auth-link q-ml-sm"
                  >สมัครสมาชิก (Register)</router-link
                >
                <router-link to="/forgot-password" class="auth-link q-mr-sm"
                  >ลืมรหัสผ่าน?</router-link
                >
              </div>
            </q-card-section>

            <q-card-section class="q-px-xl q-pb-xl">
              <q-btn
                type="submit"
                label="เข้าสู่ระบบ"
                class="btn full-width q-py-sm text-weight-bold q-mb-lg"
                unelevated
                rounded
                no-caps
                :loading="signinLoading"
                :disable="signinLoading"
                @click="handleLogin"
                style="background-color: #e91e63"
              />

              <div class="row items-center q-mb-lg">
                <q-separator dark class="col" style="background: rgba(255, 255, 255, 0.1)" />
                <div class="q-px-md text-grey-5 text-caption text-weight-medium">
                  หรือเข้าสู่ระบบด้วย
                </div>
                <q-separator dark class="col" style="background: rgba(255, 255, 255, 0.1)" />
              </div>

              <div class="row q-col-gutter-md justify-center">
                <div class="col-12 col-sm-6">
                  <q-btn
                    type="button"
                    @click="handleGoogleLogin"
                    :disable="!isReady || googleLoading"
                    unelevated
                    rounded
                    no-caps
                    class="btn btn-google full-width"
                  >
                    <img src="../assets/Google.svg" class="social-icon q-mr-xs" />
                    <span class="text-weight-bold text-">Google</span>
                  </q-btn>
                </div>

                <div class="col-12 col-sm-6">
                  <q-btn type="button" unelevated rounded no-caps class="btn btn-thaid full-width">
                    <img src="../assets/ThaID.png" class="social-icon q-mr-xs" />
                    <span class="text-weight-bold">ThaID</span>
                  </q-btn>
                </div>
              </div>
            </q-card-section>
          </q-form>

          <q-inner-loading
            :showing="googleLoading"
            class="login-card"
            style="
              background-color: rgba(0, 0, 0, 0.7);
              backdrop-filter: blur(1px);
              -webkit-backdrop-filter: blur(1px);
            "
          >
            <q-spinner-puff size="80px" color="pink-6" />
          </q-inner-loading>
        </q-card>
      </div>
    </div>

    <q-page-sticky position="bottom-right" :offset="[24, 24]">
      <q-btn round icon="pets" size="sm" unelevated class="number-badge" to="/admin"
        ><q-tooltip class="text-white">ไปหน้า Admin</q-tooltip>
      </q-btn>
    </q-page-sticky>
  </q-page>
</template>

<style scoped lang="scss">
.login-card {
  border-radius: 16px;
  color: #ffffff;
  background-color: $secondary;
}

.number-badge {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: #fce4ec;
  color: #e91e63;
  font-size: 0.9rem;
}

:deep(.shake-now .q-field__messages) {
  animation: error-shake 0.4s ease;
}
:deep(.q-field__messages) {
  transition: none !important;
  opacity: 1 !important;
}
:deep(.q-field--outlined .q-field__control) {
  background-color: $background !important;
  border-radius: 12px;
  border: 1px solid #d1d5db !important;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05) !important;
  transition: border-color 0.3s ease !important;
}
:deep(.q-field--outlined .q-field__control:before),
:deep(.q-field--outlined .q-field__control:after) {
  content: none !important;
  display: none !important;
}
:deep(.q-field--outlined .q-field__control:hover) {
  border-color: $accent !important;
  box-shadow: 0 0 0 1.5px $accent !important;
  transition: box-shadow 0.3s ease !important;
}
:deep(.q-field--focused .q-field__control) {
  border-color: $accent !important;
  border-width: 1px !important;
  box-shadow:
    0 0 0 1.5px $accent,
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

:deep(.btn .q-focus-helper) {
  display: none !important;
}
.btn {
  height: 40px;
  cursor: pointer;
  border-radius: 12px;
}
.btn-google:hover,
.btn-thaid:hover {
  transform: translateY(-2px);
  transition:
    transform 0.25s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.25s ease;
}
.btn-google {
  background-color: #f1f1f1 !important;
  color: #424242 !important;
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
