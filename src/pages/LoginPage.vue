<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from 'src/stores/user-store'; // เพิ่มบรรทัดนี้
const router = useRouter();

// ตัวแปรรับค่าจากฟอร์ม
const username = ref('');
const password = ref('');
const store = useUserStore(); // เรียกใช้ Store

const handleLogin = () => {
  console.log('Login with:', username.value, password.value);
  store.login(username.value);
  // จำลองว่า Login ผ่านแล้วกลับไปหน้าแรก
  router.push('/home');
};
</script>

<template>
  <q-page class="bg-white flex flex-center">
    <div class="container-width row q-col-gutter-xl items-start">

      <div class="col-12 col-md-7 text-dark">
        <h2 class="text-h4 text-weight-bold text-red-8 q-mb-md">การเข้าสู่ระบบเพื่อลงทะเบียนอบรม</h2>

        <div class="q-gutter-y-md text-body1">
          <div class="row">
            <div class="col-auto text-weight-bold q-mr-sm text-red-8">1.</div>
            <div class="col">
              <div class="text-weight-bold">สำหรับนักศึกษาและบุคลากรมหาวิทยาลัย:</div>
              <div class="text-grey-8">ใช้ชื่อผู้ใช้และรหัสผ่านเดียวกับระบบ Email มหาวิทยาลัย</div>
            </div>
          </div>

          <div class="row">
            <div class="col-auto text-weight-bold q-mr-sm text-red-8">2.</div>
            <div class="col">
              <div class="text-weight-bold">สำหรับบุคคลภายนอก:</div>
              <div class="text-grey-8">กรุณาสมัครสมาชิกก่อนเข้าใช้งานระบบ โดยคลิกที่ลิงก์ "สมัครสมาชิก" ด้านล่าง</div>
            </div>
          </div>

          <div class="row">
            <div class="col-auto text-weight-bold q-mr-sm text-red-8">3.</div>
            <div class="col">
              <div class="text-weight-bold">หากมีปัญหาในการเข้าสู่ระบบ:</div>
              <div class="text-grey-8">กรุณาติดต่อเจ้าหน้าที่ผ่านช่องทาง "ติดต่อเรา" หรือโทร 02-123-4567</div>
            </div>
          </div>

          <div class="row">
            <div class="col-auto text-weight-bold q-mr-sm text-red-8">4.</div>
            <div class="col">
              <div class="text-weight-bold">ข้อมูลส่วนบุคคล:</div>
              <div class="text-grey-8">ระบบจะเก็บข้อมูลการเข้าใช้งานเพื่อการปรับปรุงบริการและการออกใบรับรองหลักสูตร
              </div>
            </div>
          </div>
        </div>

        <div class="bg-light-blue-1 q-pa-md q-mt-lg rounded-borders text-blue-9"
          style="border-left: 5px solid #29b6f6;">
          <div class="text-weight-bold q-mb-xs flex items-center">
            <q-icon name="info" size="sm" class="q-mr-xs" /> หมายเหตุ:
          </div>
          <div>การลงทะเบียนเรียนจะสมบูรณ์เมื่อได้รับการยืนยันจากระบบ และจะได้รับอีเมลแจ้งรายละเอียดการอบรม</div>
        </div>
      </div>

      <div class="col-12 col-md-5">
        <q-card class="bg-grey-10 text-white shadow-10" style="border-radius: 8px;">
          <q-card-section class="text-center q-pt-lg">
            <div class="text-h5 text-weight-bold">เข้าสู่ระบบ</div>
          </q-card-section>

          <q-card-section class="q-px-lg q-py-md">
            <label class="text-body2 text-grey-4 q-mb-xs block">ชื่อผู้ใช้ (Username)</label>
            <q-input v-model="username" outlined bg-color="white" placeholder="กรอกชื่อผู้ใช้" dense class="q-mb-md" />

            <label class="text-body2 text-grey-4 q-mb-xs block">รหัสผ่าน (Password)</label>
            <q-input v-model="password" outlined bg-color="white" type="password" placeholder="กรอกรหัสผ่าน" dense />

            <div class="q-mt-md">
              <a href="#" class="text-grey-4 text-decoration-underline" style="font-size: 14px;">สมัครสมาชิก
                (Register)</a>
            </div>
          </q-card-section>

          <q-card-section class="q-px-lg q-pb-lg row justify-end">
            <q-btn label="SIGN IN" color="red-7" text-color="white" size="md" padding="8px 24px" unelevated
              @click="handleLogin" />
          </q-card-section>
        </q-card>
      </div>

    </div>
  </q-page>
</template>

<style scoped>
.container-width {
  max-width: 1100px;
  width: 100%;
  padding: 0 20px;
}
</style>
