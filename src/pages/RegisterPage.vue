<template>
  <q-page class="flex justify-center items-start q-pa-sm q-md-pa-md page-container">
    <div
      class="row q-col-gutter-y-xs q-col-gutter-md-xl q-pb-md full-width items-center justify-center relative-position main-content"
      style="max-width: 1100px; margin: 0 auto"
    >
      <div class="col-12 col-md-3 stepper-desktop-only">
        <div class="q-pt-sm q-pt-md-md stepper-wrapper">
          <div
            v-for="(s, index) in stepsList"
            :key="s.name"
            class="step-item"
            :class="{ 'is-active': step === s.name, 'is-done': step > s.name }"
          >
            <div
              v-if="index < stepsList.length - 1"
              class="step-line"
              :class="{ 'line-done': step > s.name }"
            ></div>

            <div class="step-circle flex flex-center shadow-2 relative-position z-top">
              <q-icon v-if="step > s.name" name="check" size="xs" />
              <q-icon v-else :name="s.icon" size="xs" />
            </div>

            <div class="step-text q-ml-md">
              <div class="text-caption tracking-wide transition-colors text-grey-6">
                ขั้นตอนที่ {{ s.name }}
              </div>
              <div
                class="text-subtitle1 transition-colors text-weight-medium"
                :class="step >= s.name ? 'text-pink-6 text-weight-bold' : 'text-grey-6'"
              >
                {{ s.title }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-12 col-md-9">
        <q-card
          class="register-card card-fixed-height shadow-10 column full-width"
          :class="{ 'is-shaking': shakeTrigger }"
        >
          <q-card-section class="col-auto text-center q-pt-lg q-pb-sm relative-position">
            <div
              class="text-h4 text-md-h4 text-weight-bold text-white q-mt-sm q-mb-lg q-mt-md-none"
            >
              สมัครสมาชิก
            </div>

            <div class="stepper-mobile-only q-mt-md q-px-sm">
              <div class="stepper-wrapper">
                <div
                  v-for="(s, index) in stepsList"
                  :key="s.name"
                  class="step-item"
                  :class="{ 'is-active': step === s.name, 'is-done': step > s.name }"
                >
                  <div
                    v-if="index < stepsList.length - 1"
                    class="step-line"
                    :class="{ 'line-done': step > s.name }"
                  ></div>

                  <div class="step-circle flex flex-center shadow-2 relative-position z-top">
                    <q-icon v-if="step > s.name" name="check" size="xs" />
                    <q-icon v-else :name="s.icon" size="xs" />
                  </div>

                  <div class="step-text q-ml-md">
                    <div
                      class="text-subtitle1 transition-colors text-weight-medium"
                      :class="step >= s.name ? 'text-pink-6 text-weight-bold' : 'text-grey-6'"
                    >
                      {{ s.title }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <q-separator class="q-mt-md" style="opacity: 0.2" />
          </q-card-section>

          <q-card-section class="col q-pa-none panel-section">
            <q-tab-panels
              v-model="step"
              animated
              swipeable
              transition-prev="slide-right"
              transition-next="slide-left"
              class="bg-transparent full-height"
            >
              <q-tab-panel :name="1" class="panel-content">
                <div class="form-wrapper">
                  <q-form
                    ref="step1Form"
                    greedy
                    class="row q-col-gutter-x-md q-col-gutter-y-lg q-mb-xl"
                  >
                    <div class="col-12 flex column items-center q-pb-sm">
                      <q-avatar
                        size="90px"
                        class="bg-grey-8 cursor-pointer relative-position avatar-upload shadow-5 q-mb-md"
                      >
                        <img
                          v-if="previewImage"
                          :src="previewImage"
                          style="object-fit: cover"
                          class="absolute-center"
                        />
                        <q-icon
                          v-else
                          name="photo_camera"
                          color="grey-4"
                          size="32px"
                          class="absolute-center"
                        />
                        <q-file
                          v-model="form.profilePic"
                          class="absolute-full opacity-0"
                          accept="image/*"
                          @update:model-value="onFileChange"
                        />
                      </q-avatar>
                      <div class="text-caption text-grey-5">รูปโปรไฟล์ (ไม่บังคับ)</div>
                    </div>

                    <div class="col-12 col-md-4">
                      <label class="block text-caption text-md-subtitle2 text-grey-5 q-mb-xs"
                        >ชื่อผู้ใช้ (Username) <span class="text-negative">*</span></label
                      >
                      <q-input
                        v-model="form.username"
                        outlined
                        dense
                        bottom-slots
                        :rules="rules.username"
                      >
                        <template v-slot:prepend
                          ><q-icon name="person" size="xs" class="q-pr-xs icon-input"
                        /></template>
                      </q-input>
                    </div>

                    <div class="col-12 col-md-4">
                      <label class="block text-caption text-md-subtitle2 text-grey-5 q-mb-xs"
                        >รหัสผ่าน (Password) <span class="text-negative">*</span></label
                      >
                      <q-input
                        v-model="form.password"
                        outlined
                        dense
                        bottom-slots
                        :type="isPassword ? 'password' : 'text'"
                        :rules="rules.password"
                      >
                        <template v-slot:prepend
                          ><q-icon name="lock" size="xs" class="q-pr-xs icon-input"
                        /></template>
                        <template v-slot:append>
                          <q-icon
                            v-if="form.password"
                            :name="isPassword ? 'visibility_off' : 'visibility'"
                            class="cursor-pointer"
                            @click="isPassword = !isPassword"
                          />
                        </template>
                      </q-input>
                    </div>

                    <div class="col-12 col-md-4">
                      <label class="block text-caption text-md-subtitle2 text-grey-5 q-mb-xs"
                        >ยืนยันรหัสผ่าน <span class="text-negative">*</span></label
                      >
                      <q-input
                        ref="verifyPasswordRef"
                        v-model="form.verifyPassword"
                        outlined
                        dense
                        bottom-slots
                        :type="isPassword ? 'password' : 'text'"
                        :rules="rules.verifyPassword"
                      >
                        <template v-slot:prepend
                          ><q-icon name="lock_clock" size="xs" class="q-pr-xs icon-input"
                        /></template>
                      </q-input>
                    </div>
                  </q-form>
                </div>
              </q-tab-panel>

              <q-tab-panel :name="2" class="panel-content">
                <div class="form-wrapper">
                  <q-form
                    ref="step2Form"
                    greedy
                    class="row q-col-gutter-x-md q-col-gutter-y-sm items-stretch"
                  >
                    <div class="col-12 col-md-5">
                      <div class="text-subtitle2 text-weight-bold text-pink-4 q-mb-sm">
                        ข้อมูลภาษาไทย
                      </div>
                      <div class="row q-col-gutter-x-sm">
                        <div class="col-12 col-sm-4">
                          <label class="block text-caption text-md-subtitle2 text-grey-5 q-mb-xs"
                            >คำนำหน้า <span class="text-negative">*</span></label
                          >
                          <q-select
                            v-model="form.title"
                            :options="titleOptions"
                            outlined
                            dense
                            bottom-slots
                            :rules="[(val) => !!val || 'กรุณาเลือก']"
                          />
                        </div>
                        <div class="col-12 col-sm-8">
                          <label class="block text-caption text-md-subtitle2 text-grey-5 q-mb-xs"
                            >ชื่อ (ไทย) <span class="text-negative">*</span></label
                          >
                          <q-input
                            v-model="form.firstNameTh"
                            outlined
                            dense
                            bottom-slots
                            :rules="[(val) => !!val || 'กรุณากรอกชื่อ']"
                          />
                        </div>
                        <div class="col-12">
                          <label class="block text-caption text-md-subtitle2 text-grey-5 q-mb-xs"
                            >นามสกุล (ไทย) <span class="text-negative">*</span></label
                          >
                          <q-input
                            v-model="form.lastNameTh"
                            outlined
                            dense
                            bottom-slots
                            :rules="[(val) => !!val || 'กรุณากรอกนามสกุล']"
                          />
                        </div>
                        <div class="col-12">
                          <label class="block text-caption text-md-subtitle2 text-grey-5 q-mb-xs"
                            >ตำแหน่ง/ยศ (ไทย)</label
                          >
                          <q-input
                            v-model="form.rankTh"
                            outlined
                            dense
                            bottom-slots
                            placeholder="เช่น รศ., ผศ."
                          />
                        </div>
                      </div>
                    </div>

                    <div class="col-12 col-md-2 flex flex-center gt-sm">
                      <q-separator vertical dark style="opacity: 0.2; height: 100%" />
                    </div>
                    <div class="col-12 lt-md">
                      <q-separator class="q-my-sm" style="opacity: 0.1" />
                    </div>

                    <div class="col-12 col-md-5">
                      <div class="text-subtitle2 text-weight-bold text-pink-4 q-mb-sm">
                        ข้อมูลภาษาอังกฤษ
                      </div>
                      <div class="row q-col-gutter-x-sm">
                        <div class="col-12">
                          <label class="block text-caption text-md-subtitle2 text-grey-5 q-mb-xs"
                            >ชื่อ (อังกฤษ)</label
                          >
                          <q-input
                            v-model="form.firstNameEn"
                            outlined
                            dense
                            bottom-slots
                            @update:model-value="
                              (val) => (form.firstNameEn = (val as string).toUpperCase())
                            "
                          />
                        </div>
                        <div class="col-12">
                          <label class="block text-caption text-md-subtitle2 text-grey-5 q-mb-xs"
                            >นามสกุล (อังกฤษ)</label
                          >
                          <q-input
                            v-model="form.lastNameEn"
                            outlined
                            dense
                            bottom-slots
                            @update:model-value="
                              (val) => (form.lastNameEn = (val as string).toUpperCase())
                            "
                          />
                        </div>
                        <div class="col-12">
                          <label class="block text-caption text-md-subtitle2 text-grey-5 q-mb-xs"
                            >ตำแหน่ง/ยศ (อังกฤษ)</label
                          >
                          <q-input
                            v-model="form.rankEn"
                            outlined
                            dense
                            bottom-slots
                            placeholder="เช่น ASSOC. PROF. (ถ้ามี)"
                            @update:model-value="
                              (val) => (form.rankEn = (val as string).toUpperCase())
                            "
                          />
                        </div>
                      </div>
                    </div>
                  </q-form>
                </div>
              </q-tab-panel>

              <q-tab-panel :name="3" class="panel-content">
                <div class="form-wrapper">
                  <q-form ref="step3Form" greedy class="row q-col-gutter-x-md q-col-gutter-y-sm">
                    <div class="col-12 col-md-6">
                      <label class="block text-caption text-md-subtitle2 text-grey-5 q-mb-xs"
                        >อีเมล (Email) <span class="text-negative">*</span></label
                      >
                      <q-input
                        v-model="form.email"
                        outlined
                        dense
                        bottom-slots
                        :rules="rules.email"
                        type="email"
                      >
                        <template v-slot:prepend
                          ><q-icon name="email" size="xs" class="q-pr-xs icon-input"
                        /></template>
                      </q-input>
                    </div>
                    <div class="col-12 col-md-6">
                      <label class="block text-caption text-md-subtitle2 text-grey-5 q-mb-xs"
                        >เบอร์โทรศัพท์มือถือ <span class="text-negative">*</span></label
                      >
                      <q-input
                        v-model="form.phone"
                        outlined
                        dense
                        bottom-slots
                        mask="###-###-####"
                        unmasked-value
                        :rules="[(val) => !!val || 'กรุณากรอกเบอร์โทรศัพท์']"
                      >
                        <template v-slot:prepend
                          ><q-icon name="phone" size="xs" class="q-pr-xs icon-input"
                        /></template>
                      </q-input>
                    </div>

                    <div class="col-12">
                      <q-separator dark class="q-my-sm q-mb-md" style="opacity: 0.1" />
                    </div>

                    <div class="col-12 col-md-6">
                      <label class="block text-caption text-md-subtitle2 text-grey-5 q-mb-xs"
                        >ชื่อหน่วยงาน</label
                      >
                      <q-input
                        v-model="form.organization"
                        outlined
                        dense
                        bottom-slots
                        placeholder="เช่น มหาวิทยาลัยบูรพา"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <label class="block text-caption text-md-subtitle2 text-grey-5 q-mb-xs"
                        >ตำแหน่งการทำงาน</label
                      >
                      <q-input
                        v-model="form.position"
                        outlined
                        dense
                        bottom-slots
                        placeholder="เช่น นักวิชาการคอมพิวเตอร์"
                      />
                    </div>
                  </q-form>
                </div>
              </q-tab-panel>

              <q-tab-panel :name="4" class="panel-content">
                <div class="form-wrapper">
                  <q-form ref="step4Form" greedy class="row q-col-gutter-x-md q-col-gutter-y-sm">
                    <div class="col-12">
                      <label class="block text-caption text-md-subtitle2 text-grey-5 q-mb-xs"
                        >ชื่อ/ที่อยู่ ที่ใช้สำหรับออกใบเสร็จ</label
                      >
                      <q-input
                        v-model="form.billingAddress"
                        type="textarea"
                        rows="3"
                        outlined
                        dense
                        bottom-slots
                        placeholder="หากไม่ระบุ ระบบจะใช้ข้อมูลส่วนตัวและหน่วยงานก่อนหน้า"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <label class="block text-caption text-md-subtitle2 text-grey-5 q-mb-xs"
                        >จังหวัด <span class="text-negative">*</span></label
                      >
                      <q-select
                        v-model="form.province"
                        :options="provinceOptions"
                        outlined
                        dense
                        bottom-slots
                        :rules="[(val) => !!val || 'กรุณาเลือกจังหวัด']"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <label class="block text-caption text-md-subtitle2 text-grey-5 q-mb-xs"
                        >รหัสไปรษณีย์</label
                      >
                      <q-input v-model="form.postalCode" mask="#####" outlined dense bottom-slots />
                    </div>
                  </q-form>
                </div>
              </q-tab-panel>
            </q-tab-panels>
          </q-card-section>

          <q-card-section class="col-auto">
            <div class="row justify-between items-center q-px-sm q-px-md-lg q-pb-sm">
              <q-btn
                v-if="step > 1"
                outline
                @click="previousStep"
                label="ย้อนกลับ"
                icon="chevron_left"
                class="btn-nav btn-back q-pl-sm"
                no-caps
              />
              <div v-else></div>

              <q-btn
                v-if="step < 4"
                @click="nextStep"
                unelevated
                label="ถัดไป"
                icon-right="chevron_right"
                class="btn-nav btn-next text-weight-bold q-pr-none"
                no-caps
              />
              <q-btn
                v-else
                @click="handleRegister"
                unelevated
                label="ยืนยันสมัคร"
                icon-right="check_circle"
                class="btn-nav btn-next text-weight-bold q-pr-md q-pl-lg"
                no-caps
                :loading="registerLoading"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar, type QForm, type QInput } from 'quasar';
import { useAuthStore } from 'src/stores/auth-store';
import type { RegisterDto } from 'src/models/auth';

const authStore = useAuthStore();

const router = useRouter();
const $q = useQuasar();

const step1Form = ref<QForm | null>(null);
const step2Form = ref<QForm | null>(null);
const step3Form = ref<QForm | null>(null);
const step4Form = ref<QForm | null>(null);
const verifyPasswordRef = ref<QInput | null>(null);

const step = ref(1);
const isPassword = ref(true);
const registerLoading = ref(false);
const previewImage = ref<string | null>(null);
const shakeTrigger = ref(false);

const stepsList = [
  { name: 1, title: 'บัญชีผู้ใช้', icon: 'manage_accounts' },
  { name: 2, title: 'ข้อมูลส่วนตัว', icon: 'badge' },
  { name: 3, title: 'การติดต่อ', icon: 'contact_mail' },
  { name: 4, title: 'ใบเสร็จ', icon: 'receipt_long' },
];

const titleOptions = ['นาย', 'นาง', 'นางสาว'];
const provinceOptions = ['กรุงเทพมหานคร', 'ชลบุรี', 'ระยอง', 'จันทบุรี', 'ตราด', 'สมุทรปราการ'];

const form = reactive<RegisterDto>({
  username: 'ABCD',
  password: '12345678',
  verifyPassword: '12345678',
  profilePic: null,
  title: 'นาย',
  firstNameTh: 'เอบี',
  lastNameTh: 'ซีดี',
  rankTh: '',
  firstNameEn: '',
  lastNameEn: '',
  rankEn: '',
  email: 'AB@C.D',
  phone: '0987654321',
  organization: '',
  position: '',
  billingAddress: '',
  province: 'ชลบุรี',
  postalCode: '',
});

const triggerErrorAnimation = () => {
  shakeTrigger.value = true;
  setTimeout(() => {
    shakeTrigger.value = false;
  }, 400);
};

watch(
  () => form.password,
  (newVal) => {
    if (!newVal) isPassword.value = true;
    if (form.verifyPassword && verifyPasswordRef.value) {
      verifyPasswordRef.value.validate();
    }
  },
);

const rules = {
  username: [
    (val: string) => !!val || 'กรุณากรอกชื่อผู้ใช้',
    (val: string) => /^[a-zA-Z0-9_]+$/.test(val) || 'ใช้ได้เฉพาะ a-z, A-Z, 0-9 และ _',
  ],
  password: [
    (val: string) => !!val || 'กรุณากรอกรหัสผ่าน',
    (val: string) => val.length >= 8 || 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร',
  ],
  verifyPassword: [
    (val: string) => !!val || 'กรุณายืนยันรหัสผ่าน',
    (val: string) => val === form.password || 'รหัสผ่านไม่ตรงกัน',
  ],
  email: [
    (val: string) => !!val || 'กรุณากรอกอีเมล',
    (val: string) => /.+@.+\..+/.test(val) || 'รูปแบบอีเมลไม่ถูกต้อง',
  ],
};

const onFileChange = (file: File | null) => {
  if (previewImage.value) {
    URL.revokeObjectURL(previewImage.value);
  }
  if (file) {
    previewImage.value = URL.createObjectURL(file);
  } else {
    previewImage.value = null;
  }
};

const nextStep = async () => {
  let valid = true;
  if (step.value === 1) valid = (await step1Form.value?.validate(true)) ?? true;
  else if (step.value === 2) valid = (await step2Form.value?.validate(true)) ?? true;
  else if (step.value === 3) valid = (await step3Form.value?.validate(true)) ?? true;

  if (valid) {
    step.value++;
  } else {
    triggerErrorAnimation();
  }
};

const previousStep = () => {
  if (step.value > 1) {
    step.value--;
  }
};

const handleRegister = async () => {
  const valid = (await step4Form.value?.validate(true)) ?? true;
  if (!valid) {
    triggerErrorAnimation();
    return;
  }

  registerLoading.value = true;
  try {
    const isSuccess = await authStore.register(form);

    if (isSuccess) {
      // 2. แสดงแจ้งเตือน
      $q.notify({
        color: 'positive',
        icon: 'check_circle',
        message: 'สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ',
        position: 'bottom',
      });

      // 3. ส่งไปหน้า Login
      router.push('/login');
    }
  } catch (error) {
    $q.notify({
      color: 'negative',
      message: 'เกิดข้อผิดพลาดในการสมัครสมาชิก กรุณาลองใหม่อีกครั้ง',
      position: 'bottom',
    });
  } finally {
    registerLoading.value = false;
  }
};

onUnmounted(() => {
  if (previewImage.value) {
    URL.revokeObjectURL(previewImage.value);
  }
});
</script>

<style scoped lang="scss">
/* Container พื้นฐาน */
.page-container {
  min-height: 100vh;
  position: relative;
  background-color: $background;
  transition: background-color 0.4s ease;
  overflow-x: hidden;
}

.main-content {
  z-index: 10;
  padding-top: 12px;
}

.transition-colors {
  transition: color 0.3s ease;
}

/* ================= การคุมความสูง Layout ของ Card ================= */
.register-card {
  width: 100%;
  max-width: 820px;
  margin: 0 auto;
  border-radius: 16px;
  overflow: hidden;
  color: #ffffff;
  background-color: $secondary;
  transition: background-color 0.3s ease;
}

/* ล็อกความสูงเฉพาะบน PC Desktop ให้เท่ากันทุกหน้า */
@media (min-width: 1024px) {
  .card-fixed-height {
    height: 580px;
  }
}

/* ให้พื้นที่ตรงกลางยืดและเลื่อนได้ */
.panel-section {
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* ================= Input Styles ================= */
:deep(.q-field--outlined .q-field__control) {
  background-color: $background !important;
  border-radius: 10px;
  border: 1px solid #d1d5db !important;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05) !important;
  transition:
    background-color 0.3s,
    border-color 0.3s,
    box-shadow 0.3s !important;
}

:deep(.q-field--outlined:hover .q-field__control) {
  border-color: $accent !important;
  box-shadow: 0 0 0 1.5px $accent !important;
}

:deep(.q-field--focused .q-field__control) {
  border-color: $accent !important;
  border-width: 1px !important;
  box-shadow:
    0 0 0 1.5px $accent,
    0 0 0 3px rgba(79, 70, 229, 0.1) !important;
}

:deep(.q-field--outlined .q-field__control:before),
:deep(.q-field--outlined .q-field__control:after) {
  content: none !important;
  display: none !important;
}

:deep(.q-field__bottom) {
  background-color: transparent !important;
  padding-left: 4px;
  padding-top: 4px;
}

:deep(.q-field__messages) {
  transition: none !important;
  opacity: 1 !important;
}

/* ================= ปุ่ม Navigation ================= */
.btn-nav {
  min-width: 110px;
  height: 40px;
  border-radius: 20px;
  transition: all 0.3s ease;
}

@media (min-width: 768px) {
  .btn-nav {
    min-width: 130px;
    height: 44px;
    border-radius: 22px;
  }
}

.btn-back {
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #bdbdbd !important;
  &:hover {
    border-color: #e91e63;
    color: #e91e63 !important;
    background: rgba(233, 30, 99, 0.05);
    transform: translateX(-3px);
  }
}

.btn-next {
  background: linear-gradient(135deg, #e91e63, #c2185b) !important;
  color: white;
  box-shadow: 0 4px 15px rgba(233, 30, 99, 0.25);
  &:hover {
    box-shadow: 0 6px 20px rgba(233, 30, 99, 0.5);
    transform: translateY(-2px);
  }
}

:deep(.is-shaking .q-field--error .q-field__messages) {
  animation: error-shake 0.4s ease;
}

.avatar-upload {
  transition: all 0.3s ease;
  border: 2px dashed rgba(255, 255, 255, 0.2);
  &:hover {
    opacity: 0.8;
    border-color: #e91e63;
  }
}

.opacity-0 {
  opacity: 0;
  cursor: pointer;
}

/* ================= Tab Panels (จัดกึ่งกลางและระยะห่าง) ================= */
.panel-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 16px !important;
}

.form-wrapper {
  width: 100%;
  max-width: 680px;
}

@media (min-width: 1024px) {
  .panel-content {
    padding: 10px 48px !important;
  }
}

/* ซ่อน Scrollbar ด้านใน Panel */
:deep(.q-panel.scroll),
:deep(.q-tab-panel) {
  scrollbar-width: none;
  -ms-overflow-style: none;
  overflow-y: auto;
}
:deep(.q-panel.scroll::-webkit-scrollbar),
:deep(.q-tab-panel::-webkit-scrollbar) {
  display: none;
}

/* ================= Custom Stepper ================= */
.stepper-wrapper {
  display: flex;
  flex-direction: column;
}

.step-item {
  display: flex;
  align-items: center;
  position: relative;
  margin-bottom: 2.5rem;
}

.step-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  color: #616161;
  transition: all 0.4s ease;
  z-index: 2;
}

.step-line {
  position: absolute;
  left: 19px;
  top: 40px;
  width: 2px;
  height: calc(100% + 1rem);
  background: #e0e0e0;
  z-index: 1;
  transition: background 0.4s ease;
}

.step-line.line-done {
  background: #e91e63 !important;
}

.is-active .step-circle,
.is-done .step-circle {
  background: #e91e63 !important;
  border-color: transparent !important;
  color: white !important;
  box-shadow: 0 0 10px rgba(233, 30, 99, 0.3);
}

.is-active .step-circle {
  transform: scale(1.1);
}

/* CSS สำหรับการสลับซ่อน/แสดง Stepper ตามขนาดหน้าจอ */
.stepper-desktop-only {
  display: block;
}
.stepper-mobile-only {
  display: none;
}

@media (min-width: 768px) {
  .step-circle {
    width: 48px;
    height: 48px;
  }
  .step-line {
    left: 23px;
    top: 48px;
  }
}

/* Responsive Stepper บน Mobile */
@media (max-width: 1023px) {
  .stepper-desktop-only {
    display: none;
  }
  .stepper-mobile-only {
    display: block;
  }

  .stepper-wrapper {
    flex-direction: row;
    justify-content: space-between;
    margin-bottom: 1.5rem; /* เพิ่มช่องว่างด้านล่างหน่อยเพราะมีตัวหนังสือ */
    padding: 0;
  }

  .step-item {
    margin-bottom: 0;
    flex-direction: column; /* จัดวงกลมกับตัวหนังสือเป็นแนวตั้ง */
    flex: 1;
    position: relative;
    align-items: center; /* จัดให้ทุกอย่างอยู่กึ่งกลาง */
    text-align: center;
  }

  /* แสดงข้อความ Title */
  .step-text {
    display: block; /* ยกเลิกการซ่อน */
    margin-left: 0; /* ล้าง margin เดิมของ Desktop */
    margin-top: 8px; /* เว้นระยะห่างจากวงกลมลงมา */
  }

  /* ปรับขนาดตัวหนังสือให้เล็กลงพอดีกับจอมือถือ */
  .step-text .text-caption {
    font-size: 10px;
    line-height: 1;
  }
  .step-text .text-subtitle1 {
    font-size: 11px;
    line-height: 1.2;
    margin-top: 2px;
    text-shadow: none !important;
    letter-spacing: 0.3px;
  }

  /* จัดตำแหน่งเส้นเชื่อมใหม่ให้ตรงกึ่งกลางวงกลมเสมอ */
  .step-line {
    left: 50%;
    top: 20px;
    width: 100%;
    height: 2px;
  }
  .step-item:last-child .step-line {
    display: none;
  }
}
</style>
