<template>
  <q-page class="flex flex-center q-pa-md">
    <q-card class="register-card shadow-24" :class="{ 'is-shaking': shakeTrigger }">
      <q-card-section class="text-center q-pt-xl q-pb-sm relative-position">
        <q-btn
          icon="arrow_back"
          flat
          round
          dense
          class="absolute-top-left q-mt-md q-ml-md text-grey-4 back-btn"
          to="/login"
        />
        <div class="text-h4 text-weight-bolder text-white">สมัครสมาชิก</div>
        <div class="text-grey-4 q-mt-sm">กรุณากรอกข้อมูลให้ครบถ้วนเพื่อลงทะเบียน</div>
      </q-card-section>

      <q-card-section class="q-pa-none">
        <q-stepper
          v-model="step"
          ref="stepper"
          color="pink-6"
          animated
          alternative-labels
          class="bg-transparent shadow-0 custom-stepper q-pb-lg"
        >
          <q-step :name="1" title="บัญชีผู้ใช้" icon="manage_accounts" :done="step > 1">
            <q-form ref="step1Form" greedy class="row q-col-gutter-x-md q-col-gutter-y-sm q-pt-md">
              <div class="col-12">
                <label class="block text-subtitle2 text-grey-4 q-mb-xs"
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

              <div class="col-12 col-md-6">
                <label class="block text-subtitle2 text-grey-4 q-mb-xs"
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

              <div class="col-12 col-md-6">
                <label class="block text-subtitle2 text-grey-4 q-mb-xs"
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
          </q-step>

          <q-step :name="2" title="ข้อมูลส่วนตัว" icon="badge" :done="step > 2">
            <q-form ref="step2Form" greedy class="row q-col-gutter-x-md q-col-gutter-y-sm q-pt-sm">
              <div class="col-12 text-center q-mb-sm">
                <q-avatar
                  size="90px"
                  class="bg-grey-8 cursor-pointer relative-position avatar-upload shadow-5"
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
                    size="36px"
                    class="absolute-center"
                  />
                  <q-file
                    v-model="form.profilePic"
                    class="absolute-full opacity-0"
                    accept="image/*"
                    @update:model-value="onFileChange"
                  />
                </q-avatar>
                <div class="text-caption text-grey-4 q-mt-xs">รูปโปรไฟล์ (ไม่บังคับ)</div>
              </div>

              <div class="col-12 q-pb-none">
                <div class="text-subtitle2 text-weight-bold text-pink-4">ข้อมูลภาษาไทย</div>
              </div>

              <div class="col-12 col-sm-3">
                <label class="block text-subtitle2 text-grey-4 q-mb-xs"
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
              <div class="col-12 col-sm-4 q-pr-sm-xs">
                <label class="block text-subtitle2 text-grey-4 q-mb-xs"
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
              <div class="col-12 col-sm-5 q-pl-sm-xs">
                <label class="block text-subtitle2 text-grey-4 q-mb-xs"
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
                <label class="block text-subtitle2 text-grey-4 q-mb-xs"
                  >ตำแหน่งทางวิชาการ/ยศ (ไทย)</label
                >
                <q-input
                  v-model="form.rankTh"
                  outlined
                  dense
                  bottom-slots
                  placeholder="เช่น รศ., ผศ. (ถ้ามี)"
                />
              </div>

              <div class="col-12">
                <q-separator dark class="q-my-sm" style="opacity: 0.1" />
              </div>

              <div class="col-12 q-pb-none">
                <div class="text-subtitle2 text-weight-bold text-pink-4">ข้อมูลภาษาอังกฤษ</div>
              </div>

              <div class="col-12 col-sm-6">
                <label class="block text-subtitle2 text-grey-4 q-mb-xs">ชื่อ (อังกฤษ)</label>
                <q-input
                  v-model="form.firstNameEn"
                  outlined
                  dense
                  bottom-slots
                  @update:model-value="(val) => (form.firstNameEn = (val as string).toUpperCase())"
                />
              </div>
              <div class="col-12 col-sm-6">
                <label class="block text-subtitle2 text-grey-4 q-mb-xs">นามสกุล (อังกฤษ)</label>
                <q-input
                  v-model="form.lastNameEn"
                  outlined
                  dense
                  bottom-slots
                  @update:model-value="(val) => (form.lastNameEn = (val as string).toUpperCase())"
                />
              </div>
              <div class="col-12">
                <label class="block text-subtitle2 text-grey-4 q-mb-xs">ตำแหน่ง/ยศ (อังกฤษ)</label>
                <q-input
                  v-model="form.rankEn"
                  outlined
                  dense
                  bottom-slots
                  placeholder="เช่น ASSOC. PROF. (ถ้ามี)"
                  @update:model-value="(val) => (form.rankEn = (val as string).toUpperCase())"
                />
              </div>
            </q-form>
          </q-step>

          <q-step :name="3" title="การติดต่อ" icon="contact_mail" :done="step > 3">
            <q-form ref="step3Form" greedy class="row q-col-gutter-x-md q-col-gutter-y-sm q-pt-md">
              <div class="col-12">
                <label class="block text-subtitle2 text-grey-4 q-mb-xs">ชื่อหน่วยงาน</label>
                <q-input
                  v-model="form.organization"
                  outlined
                  dense
                  bottom-slots
                  placeholder="เช่น มหาวิทยาลัยบูรพา"
                />
              </div>
              <div class="col-12">
                <label class="block text-subtitle2 text-grey-4 q-mb-xs">ตำแหน่งการทำงาน</label>
                <q-input
                  v-model="form.position"
                  outlined
                  dense
                  bottom-slots
                  placeholder="เช่น นักวิชาการคอมพิวเตอร์"
                />
              </div>

              <div class="col-12">
                <q-separator dark class="q-my-sm" style="opacity: 0.1" />
              </div>

              <div class="col-12 col-md-6">
                <label class="block text-subtitle2 text-grey-4 q-mb-xs"
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
                <label class="block text-subtitle2 text-grey-4 q-mb-xs"
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
            </q-form>
          </q-step>

          <q-step :name="4" title="ใบเสร็จ" icon="receipt_long">
            <q-form ref="step4Form" greedy class="row q-col-gutter-x-md q-col-gutter-y-sm q-pt-md">
              <div class="col-12">
                <label class="block text-subtitle2 text-grey-4 q-mb-xs"
                  >ชื่อ/ที่อยู่ ที่ใช้สำหรับออกใบเสร็จ</label
                >
                <q-input
                  v-model="form.billingAddress"
                  type="textarea"
                  rows="4"
                  outlined
                  dense
                  bottom-slots
                  placeholder="หากไม่ระบุ ระบบจะใช้ข้อมูลส่วนตัวและหน่วยงานก่อนหน้า"
                />
              </div>
              <div class="col-12 col-sm-7">
                <label class="block text-subtitle2 text-grey-4 q-mb-xs"
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
              <div class="col-12 col-sm-5">
                <label class="block text-subtitle2 text-grey-4 q-mb-xs">รหัสไปรษณีย์</label>
                <q-input v-model="form.postalCode" mask="#####" outlined dense bottom-slots />
              </div>
            </q-form>
          </q-step>

          <template v-slot:navigation>
            <q-stepper-navigation class="row justify-between items-center q-mt-md q-px-sm">
              <q-btn
                v-if="step > 1"
                outline
                @click="stepper?.previous()"
                label="ย้อนกลับ"
                icon="chevron_left"
                class="btn-nav btn-back"
                no-caps
              />
              <div v-else></div>

              <q-btn
                v-if="step < 4"
                @click="nextStep"
                unelevated
                label="ถัดไป"
                icon-right="chevron_right"
                class="btn-nav btn-next text-weight-bold"
                no-caps
              />
              <q-btn
                v-else
                @click="handleRegister"
                unelevated
                label="ยืนยันการสมัคร"
                icon-right="check_circle"
                class="btn-nav btn-next text-weight-bold"
                no-caps
                :loading="registerLoading"
              />
            </q-stepper-navigation>
          </template>
        </q-stepper>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar, type QStepper, type QForm, type QInput } from 'quasar';

const router = useRouter();
const $q = useQuasar();

// Refs สำหรับควบคุม Stepper และ Form
const stepper = ref<QStepper | null>(null);
const step1Form = ref<QForm | null>(null);
const step2Form = ref<QForm | null>(null);
const step3Form = ref<QForm | null>(null);
const step4Form = ref<QForm | null>(null);
const verifyPasswordRef = ref<QInput | null>(null);

const step = ref(1);
const isPassword = ref(true);
const registerLoading = ref(false);
const previewImage = ref<string | null>(null);

// ตัวแปรเก็บสถานะการสั่น (Shake Animation)
const shakeTrigger = ref(false);

const titleOptions = ['นาย', 'นาง', 'นางสาว'];
const provinceOptions = ['กรุงเทพมหานคร', 'ชลบุรี', 'ระยอง', 'จันทบุรี', 'ตราด', 'สมุทรปราการ'];

const form = reactive({
  username: '',
  password: '',
  verifyPassword: '',
  profilePic: null as File | null,
  title: '',
  firstNameTh: '',
  lastNameTh: '',
  rankTh: '',
  firstNameEn: '',
  lastNameEn: '',
  rankEn: '',
  email: '',
  phone: '',
  organization: '',
  position: '',
  billingAddress: '',
  province: '',
  postalCode: '',
});

// ฟังก์ชันสั่งสั่น
const triggerErrorAnimation = () => {
  shakeTrigger.value = true;
  setTimeout(() => {
    shakeTrigger.value = false;
  }, 400);
};

// เช็ครหัสผ่าน
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

// เปลี่ยนการใช้ .validate() ปกติ เป็น .validate(true) เพื่อให้ระบบ Focus ช่องที่ไม่ผ่านให้อัตโนมัติ
const nextStep = async () => {
  let valid = true;

  if (step.value === 1) valid = (await step1Form.value?.validate(true)) ?? true;
  else if (step.value === 2) valid = (await step2Form.value?.validate(true)) ?? true;
  else if (step.value === 3) valid = (await step3Form.value?.validate(true)) ?? true;

  if (valid) {
    stepper.value?.next();
  } else {
    triggerErrorAnimation();
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
    await new Promise((resolve) => setTimeout(resolve, 1500));

    $q.notify({
      color: 'positive',
      icon: 'check_circle',
      message: 'สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ',
      position: 'top',
    });
    router.push('/login');
  } catch (error) {
    console.error(error);
  } finally {
    registerLoading.value = false;
  }
};
</script>

<style scoped lang="scss">
.register-card {
  width: 100%;
  max-width: 720px;
  border-radius: 16px;
  color: #ffffff;
  background-color: $secondary;
}

.back-btn {
  transition: color 0.3s ease;
  &:hover {
    color: #e91e63 !important;
  }
}

/* ================= ปุ่มนำทาง (Modern Buttons) ================= */
.btn-nav {
  min-width: 130px;
  height: 44px;
  border-radius: 22px;
  transition: all 0.3s ease;
}

.btn-back {
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #bdbdbd !important;
  &:hover {
    border-color: #e91e63;
    color: #e91e63 !important;
    background: rgba(233, 30, 99, 0.05);
    transform: translateX(-3px); /* เลื่อนซ้ายนิดนึงตอน Hover */
  }
}

.btn-next {
  background: linear-gradient(135deg, #e91e63, #c2185b) !important;
  color: white;
  box-shadow: 0 4px 15px rgba(233, 30, 99, 0.25);
  &:hover {
    box-shadow: 0 6px 20px rgba(233, 30, 99, 0.5);
    transform: translateY(-2px); /* ลอยขึ้นนิดนึงตอน Hover */
  }
}

/* ================= Animation ตอนลืมกรอกข้อมูล (Shake) ================= */

/* ดักจับเฉพาะช่องที่เกิด Error ตอนระบบสั่ง Shake */
:deep(.is-shaking .q-field--error .q-field__messages) {
  animation: error-shake 0.4s ease;
}

/* Avatar Upload */
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

/* ================= Custom Stepper ================= */
:deep(.custom-stepper .q-stepper__header) {
  padding: 0 5% !important;
  margin-bottom: 8px;
}
:deep(.custom-stepper .q-stepper__tab:first-child),
:deep(.custom-stepper .q-stepper__tab:last-child) {
  justify-content: center !important;
}
:deep(.custom-stepper .q-stepper__tab) {
  flex: 1 1 0% !important;
  justify-content: center !important;
  padding: 0 !important;
}
:deep(.custom-stepper .q-stepper__tab + .q-stepper__tab:before) {
  left: -50% !important;
  right: 50% !important;
}
:deep(.custom-stepper .q-stepper__title) {
  font-weight: 500;
  text-shadow: none !important;
  letter-spacing: 0.3px;
}
:deep(.custom-stepper .q-stepper__dot) {
  width: 32px !important;
  height: 32px !important;
  min-width: 32px !important;
  font-size: 16px !important;
  background-color: rgba(255, 255, 255, 0.15);
}
:deep(.custom-stepper .q-stepper__tab--active .q-stepper__dot),
:deep(.custom-stepper .q-stepper__tab--done .q-stepper__dot) {
  background-color: #e91e63 !important;
}
:deep(.custom-stepper .q-stepper__content),
:deep(.custom-stepper .q-panel) {
  overflow: hidden !important;
}

:deep(.custom-stepper ::-webkit-scrollbar) {
  display: none !important;
  width: 0 !important;
}

/* ================= Input Styles ================= */
:deep(.q-field--outlined .q-field__control) {
  background-color: #faf8f6 !important;
  border-radius: 10px;
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
  padding-left: 4px;
  padding-top: 4px;
}

/* ================= Stepper Lines Color ================= */
:deep(.q-stepper__tab .q-stepper__line::before),
:deep(.q-stepper__tab .q-stepper__line::after) {
  background: rgba(255, 255, 255, 0.1) !important;
  height: 2px !important;
  transition: background 0.4s ease;
}
:deep(.q-stepper__tab--done .q-stepper__line::before),
:deep(.q-stepper__tab--done .q-stepper__line::after) {
  background: #e91e63 !important;
  box-shadow: 0 0 8px rgba(233, 30, 99, 0.4) !important;
}
:deep(.q-stepper__tab--active .q-stepper__line::before) {
  background: #e91e63 !important;
  box-shadow: 0 0 8px rgba(233, 30, 99, 0.4) !important;
}
:deep(.q-stepper__tab:first-child .q-stepper__line::before),
:deep(.q-stepper__tab:last-child .q-stepper__line::after) {
  display: none !important;
  background: transparent !important;
}

:deep(.q-field__messages) {
  transition: none !important;
  opacity: 1 !important;
}
</style>
