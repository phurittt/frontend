<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/auth-store';
import { useQuasar } from 'quasar';

const router = useRouter();
const authStore = useAuthStore();
const $q = useQuasar();
const tab = ref('history');

// ==========================================
// 1. Mock Data: จำลองข้อมูลคอร์สที่ลงทะเบียนไว้
// ==========================================
const enrolledCourses = ref([
  {
    id: 1,
    title: 'Vue.js for Beginners',
    date: '25 มีนาคม 2026',
    status: 'รอเข้าอบรม',
    statusCode: 'registered', // 'registered', 'waiting', 'confirmed', 'cancelled'
    image: 'https://via.placeholder.com/400x200',
    canCancel: true,
    canConfirm: true,
    isOnline: false
  },
  {
    id: 2,
    title: 'Cybersecurity Awareness',
    date: '10 เมษายน 2026',
    status: 'รอคิวสำรอง',
    statusCode: 'waiting',
    image: 'https://via.placeholder.com/400x200',
    canCancel: true,
    canConfirm: false,
    isOnline: true
  },
  {
    id: 3,
    title: 'Data Science with Python',
    date: '15 พฤษภาคม 2026',
    status: 'ยืนยันเข้าร่วมแล้ว',
    statusCode: 'confirmed',
    image: 'https://via.placeholder.com/400x200',
    canCancel: false,
    canConfirm: false,
    isOnline: false
  }
]);

// จำลองข้อมูลวุฒิบัตร (UC-21)
const certificates = ref([
  {
    id: 101,
    courseTitle: 'Basic HTML/CSS & Web Design',
    dateIssued: '10 มกราคม 2026',
    certNo: 'CERT-2026-0012'
  }
]);

// ==========================================
// 2. ฟังก์ชันจัดการสถานะสีของ Chip
// ==========================================
const getStatusColor = (code: string) => {
  switch (code) {
    case 'registered': return 'blue-1 text-blue-9';
    case 'waiting': return 'orange-1 text-orange-9';
    case 'confirmed': return 'green-1 text-green-9';
    case 'cancelled': return 'grey-2 text-grey-8';
    default: return 'grey-2 text-grey-8';
  }
};

// ==========================================
// 3. ฟังก์ชันการยกเลิกการลงทะเบียน (UC-07)
// ==========================================
const showCancelDialog = ref(false);
const courseToCancel = ref<number | null>(null);

const promptCancel = (id: number) => {
  courseToCancel.value = id;
  showCancelDialog.value = true;
};

const executeCancel = async () => {
  showCancelDialog.value = false;
  const dismiss = $q.notify({ spinner: true, message: 'กำลังยกเลิกการลงทะเบียน...', color: 'primary', timeout: 0 });

  try {
    await new Promise(resolve => setTimeout(resolve, 1000)); // จำลอง API
    
    // อัปเดตข้อมูลในหน้าจอ (แก้ TypeScript Error)
    const index = enrolledCourses.value.findIndex(c => c.id === courseToCancel.value);
    if (index !== -1) {
      const targetCourse = enrolledCourses.value[index];
      if (targetCourse) {
        targetCourse.status = 'ยกเลิกการลงทะเบียนแล้ว';
        targetCourse.statusCode = 'cancelled';
        targetCourse.canCancel = false;
        targetCourse.canConfirm = false;
      }
    }

    dismiss();
    $q.notify({
      message: 'ยกเลิกการลงทะเบียนสำเร็จ ระบบได้เลื่อนคิวสำรองถัดไปแล้ว',
      color: 'positive', icon: 'check_circle', position: 'top'
    });
  } catch (error) {
    dismiss();
    $q.notify({ message: 'เกิดข้อผิดพลาด', color: 'negative', position: 'top' });
  }
};

// ==========================================
// 4. ฟังก์ชันยืนยันการเข้าร่วม (UC-08)
// ==========================================
// แก้ไข: ลบ async ออกจากฟังก์ชันหลักเพื่อแก้ ESLint
const confirmAttendance = (id: number) => {
  $q.dialog({
    title: 'ยืนยันการเข้าร่วม',
    message: 'ท่านยืนยันที่จะเข้าร่วมการอบรมในวันและเวลาดังกล่าวใช่หรือไม่?',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    const dismiss = $q.notify({ spinner: true, message: 'กำลังบันทึก...', color: 'primary', timeout: 0 });
    await new Promise(resolve => setTimeout(resolve, 800)); 
    
    // อัปเดตข้อมูลในหน้าจอ (แก้ TypeScript Error)
    const index = enrolledCourses.value.findIndex(c => c.id === id);
    if (index !== -1) {
      const targetCourse = enrolledCourses.value[index];
      if (targetCourse) {
        targetCourse.status = 'ยืนยันเข้าร่วมแล้ว';
        targetCourse.statusCode = 'confirmed';
        targetCourse.canCancel = false;
        targetCourse.canConfirm = false;
      }
    }
    
    dismiss();
    $q.notify({ message: 'ยืนยันการเข้าร่วมสำเร็จ', color: 'positive', position: 'top' });
  });
};

// ==========================================
// 5. ดาวน์โหลดวุฒิบัตร (UC-21)
// ==========================================
const downloadCertificate = (id: number) => {
  $q.notify({
    message: 'กำลังสร้างไฟล์ PDF วุฒิบัตร...',
    color: 'primary', icon: 'picture_as_pdf', position: 'top', timeout: 2000
  });
  // โค้ดสำหรับเปิดแท็บใหม่เพื่อโหลดไฟล์จาก Backend API
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
          <q-tab name="history" icon="history" label="ประวัติการอบรม" class="text-weight-bold q-px-lg" />
          <q-tab name="certificate" icon="workspace_premium" label="วุฒิบัตรของฉัน" class="text-weight-bold q-px-lg" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="tab" animated class="bg-white">
          <q-tab-panel name="history" class="q-pa-md q-pa-lg-xl">
            <div class="text-h6 text-weight-bold q-mb-lg">หลักสูตรที่ลงทะเบียนแล้ว</div>
            
            <div class="row q-col-gutter-lg">
              <div v-for="course in enrolledCourses" :key="course.id" class="col-12 col-md-6">
                <q-card bordered flat class="border-radius-16 h-100 column">
                  <div class="row no-wrap flex-grow-1">
                    <q-img :src="course.image" style="width: 140px; min-height: 100%;" fit="cover" />
                    <q-card-section class="col column justify-center q-pa-md">
                      <q-chip size="sm" :class="getStatusColor(course.statusCode)" class="q-mb-sm text-weight-bold q-px-sm" style="width: fit-content; margin-left: 0;">
                        {{ course.status }}
                      </q-chip>
                      <div class="text-subtitle1 text-weight-bold line-height-tight q-mb-xs ellipsis-2-lines">{{ course.title }}</div>
                      <div class="text-caption text-grey-6 flex items-center q-mb-sm">
                        <q-icon name="event" class="q-mr-xs" /> {{ course.date }}
                      </div>
                    </q-card-section>
                  </div>
                  
                  <q-separator />
                  
                  <q-card-actions align="right" class="q-px-md q-py-sm bg-grey-1">
                    <q-btn v-if="course.canCancel" flat color="negative" label="ยกเลิกสิทธิ์" no-caps class="text-weight-bold" @click="promptCancel(course.id)" />
                    <q-btn v-if="course.canConfirm" unelevated color="primary" label="ยืนยันเข้าร่วม" no-caps class="text-weight-bold q-px-md q-ml-sm" @click="confirmAttendance(course.id)" />
                    <q-btn v-if="course.statusCode === 'confirmed' && course.isOnline" unelevated color="positive" icon="play_circle_outline" label="เข้าเรียนออนไลน์" no-caps class="text-weight-bold q-px-md q-ml-sm" @click="router.push(`/courses/${course.id}`)" />
                  </q-card-actions>
                </q-card>
              </div>
            </div>

            <div v-if="enrolledCourses.length === 0" class="text-center q-py-xl text-grey-6">
              <q-icon name="inbox" size="64px" class="q-mb-md opacity-50" />
              <div class="text-h6">ยังไม่มีประวัติการลงทะเบียน</div>
              <q-btn outline color="primary" label="ค้นหาหลักสูตร" class="q-mt-md rounded-borders text-weight-bold" to="/courses/all" />
            </div>
          </q-tab-panel>

          <q-tab-panel name="certificate" class="q-pa-md q-pa-lg-xl">
            <div class="text-h6 text-weight-bold q-mb-lg">วุฒิบัตรที่ได้รับ</div>

            <div class="row q-col-gutter-md" v-if="certificates.length > 0">
              <div v-for="cert in certificates" :key="cert.id" class="col-12 col-sm-6 col-md-4">
                <q-card bordered flat class="border-radius-16 text-center q-pa-md certificate-card">
                  <q-icon name="workspace_premium" size="48px" color="amber-8" class="q-mb-sm" />
                  <div class="text-subtitle2 text-weight-bold ellipsis-2-lines q-mb-xs" style="min-height: 40px;">
                    {{ cert.courseTitle }}
                  </div>
                  <div class="text-caption text-grey-6 q-mb-sm">วันที่ออก: {{ cert.dateIssued }}</div>
                  <div class="text-caption text-grey-5 q-mb-md">รหัส: {{ cert.certNo }}</div>
                  <q-btn unelevated outline color="primary" icon="download" label="ดาวน์โหลด" class="full-width text-weight-bold" @click="downloadCertificate(cert.id)" />
                </q-card>
              </div>
            </div>

            <div v-else class="text-center q-py-xl text-grey-6">
              <q-icon name="workspace_premium" size="64px" class="q-mb-md opacity-50" />
              <div class="text-h6">ยังไม่มีวุฒิบัตรในขณะนี้</div>
              <div class="text-caption">คุณจะได้รับวุฒิบัตรเมื่อเข้าร่วมอบรมและทำแบบทดสอบผ่านเกณฑ์</div>
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </q-card>
    </div>

    <q-dialog v-model="showCancelDialog" persistent>
      <q-card class="q-pa-md border-radius-16" style="max-width: 400px; width: 100%;">
        <q-card-section class="text-center q-pb-none">
          <q-icon name="cancel" size="64px" color="negative" class="q-mb-md" />
          <div class="text-h6 text-weight-bold text-dark line-height-tight q-mb-sm">ยืนยันการยกเลิกสิทธิ์?</div>
          <div class="text-body1 text-grey-8 q-mb-md">
            หากท่านยกเลิก ระบบจะคืนสิทธิ์ให้ผู้ที่อยู่ในคิวสำรองลำดับถัดไปทันที
          </div>
        </q-card-section>
        <q-card-actions align="center" class="q-pt-md q-pb-sm">
          <q-btn unelevated color="negative" label="ยืนยันการยกเลิก" class="text-weight-bold q-px-md" @click="executeCancel" />
          <q-btn flat color="grey-7" label="ปิดหน้าต่าง" class="text-weight-bold q-ml-sm" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<style scoped>
.bg-light-theme { background-color: #f1f5f9; min-height: 100vh; }
.container-width { max-width: 1200px; width: 100%; }
.border-radius-20 { border-radius: 20px; }
.border-radius-16 { border-radius: 16px; }
.line-height-tight { line-height: 1.3; }
.h-100 { height: 100%; }
.flex-grow-1 { flex-grow: 1; }

.certificate-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.certificate-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}
</style>