<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const certCode = ref('');

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

const verifyCode = () => {
  if (!certCode.value) {
    $q.notify({
      message: 'กรุณากรอกรหัส Code ก่อนทำการตรวจสอบ',
      color: 'warning',
      icon: 'warning',
      position: 'top',
    });
    return;
  }
  
  $q.notify({
    message: 'กำลังตรวจสอบข้อมูล...',
    color: 'info',
    icon: 'search',
    position: 'top',
    timeout: 1500
  });
};
</script>

<template>
  <div class="q-pa-md flex flex-center bg-light-theme">
    <q-card flat class="verify-card q-pa-xl text-center bg-white">
      <q-avatar size="80px" color="orange-1" text-color="orange-7" class="q-mb-md shadow-1">
        <q-icon name="workspace_premium" size="40px" />
      </q-avatar>

      <h2 class="text-h4 text-weight-bolder text-dark q-mt-none q-mb-sm">
        ตรวจสอบวุฒิบัตร
      </h2>
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
                    style="width: 250px; display: block; max-width: 100%; border-radius: 4px;"
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
            @click="verifyCode"
          />
        </div>
      </div>
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
  transition: transform 0.2s ease, box-shadow 0.2s ease;

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
</style>