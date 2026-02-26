<template>
  <q-page class="bg-grey-2 q-pa-md q-pa-md-xl">
    <div class="container-width q-mx-auto">
      
      <div class="q-mb-xl">
        <div class="text-h5 text-weight-bolder relative-position q-pb-sm" style="display: inline-block; font-family: 'Prompt', sans-serif;">
          ข้อมูลหลักสูตร
          <div class="absolute-bottom bg-black" style="height: 4px; width: 100%;"></div>
        </div>
      </div>

      <div class="row q-col-gutter-xl" v-if="course">
        <div class="col-12 col-md-7 column q-gutter-y-lg">
          
          <q-card flat bordered class="rounded-borders q-pa-xl">
            <div class="text-h5 text-weight-bold q-mb-xl text-grey-9">{{ course.title }}</div>
            
            <div class="row q-col-gutter-y-xl">
              <div class="col-6">
                <div class="text-subtitle2 text-weight-bolder">วัน-เวลา</div>
                <div class="text-body2 text-grey-7">{{ course.date }} | {{ course.time }}</div>
              </div>
              <div class="col-6">
                <div class="text-subtitle2 text-weight-bolder">สถานที่</div>
                <div class="text-body2 text-grey-7">{{ course.location }}</div>
              </div>
              <div class="col-6">
                <div class="text-subtitle2 text-weight-bolder">ระยะเวลาทั้งหมด</div>
                <div class="text-body2 text-grey-7">6 ชั่วโมง</div> 
              </div>
              <div class="col-6">
                <div class="text-subtitle2 text-weight-bolder">จำนวนที่เปิดรับ (คน)</div>
                <div class="text-body2 text-grey-7">50</div>
              </div>
              <div class="col-12">
                <div class="text-subtitle2 text-weight-bolder">จำนวนคนที่ลงทะเบียนเรียบร้อยแล้ว</div>
                <div class="text-body2 text-grey-7">50</div>
              </div>
            </div>
          </q-card>

          <q-card flat bordered class="rounded-borders q-pa-xl">
            <div class="text-h6 text-weight-bold q-mb-lg">สิ่งที่คุณจะได้เรียนรู้</div>
            <div class="column q-gutter-y-md">
              <div v-for="(item, index) in learningItems" :key="index" class="row items-start no-wrap">
                <q-icon name="check" color="grey-6" size="20px" class="q-mr-md q-mt-xs" />
                <div class="text-body2 text-grey-8">{{ item }}</div>
              </div>
            </div>
          </q-card>
        </div>

        <div class="col-12 col-md-5 column q-gutter-y-lg">
          
        <q-card flat bordered class="rounded-borders overflow-hidden">
            <q-img 
                :src="course.image || 'https://via.placeholder.com/800x450'" 
                fit="contain"
                class="bg-grey-3"
                style="min-height: 250px; width: 100%;"
                 >
                <template v-slot:loading>
                    <q-spinner-dots color="white" />
                </template>
            </q-img>
        </q-card>

          <q-card flat bordered class="rounded-borders q-pa-xl">
            <div class="text-subtitle1 text-weight-bolder q-mb-md">เนื้อหาของหลักสูตร</div>
            <div class="course-content text-body2 text-grey-8">
              <div class="text-weight-bold q-mb-xs">1. พื้นฐานการใช้งานเครื่องมือ</div>
              <ul class="q-pl-md q-mb-lg">
                <li>แนะนำฟีเจอร์และแนวคิดพื้นฐาน</li>
                <li>โครงสร้างและการทำงานเบื้องต้น</li>
              </ul>
              <div class="text-weight-bold q-mb-xs">2. การลงมือปฏิบัติจริง</div>
              <ul class="q-pl-md">
                <li>การแก้ปัญหาและเทคนิคขั้นสูง</li>
              </ul>
            </div>

            <div class="row q-gutter-md q-mt-xl">
              <q-btn 
                unelevated 
                color="grey-9" 
                label="ซื้อ" 
                class="col text-weight-bold" 
                padding="12px" 
                style="border-radius: 8px;"
              />
              <q-btn 
                outline 
                color="grey-4" 
                text-color="grey-9"
                icon="favorite_border" 
                padding="12px" 
                style="border-radius: 8px;"
              />
            </div>
          </q-card>

        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { useCourseStore } from 'src/stores/course-store';
import { computed } from 'vue';

const route = useRoute();
const store = useCourseStore();

// รายการสิ่งที่จะได้เรียนรู้ (จำลองตาม Figma)
const learningItems = [
  'เข้าใจแนวคิดพื้นฐานและหลักการทำงานของ Vue.',
  'สามารถสร้างหน้าเว็บที่มีการโต้ตอบกับผู้ใช้งานได้',
  'สามารถพัฒนาเว็บด้วยแนวคิดแบบ Component ได้อย่างถูกต้อง',
  'เข้าใจการส่งและรับข้อมูลระหว่าง Component',
  'สามารถจัดการเหตุการณ์และข้อมูลจากผู้ใช้งานได้',
  'สามารถพัฒนาเว็บแอปพลิเคชันด้วย Vue.js ได้จริง'
];

const course = computed(() => {
  const id = Number(route.params.id);
  return store.courses.find(c => c.id === id) || store.courses[0];
});
</script>

<style scoped>
.container-width { max-width: 1200px; }
.rounded-borders { border-radius: 16px !important; }
.course-content ul { 
  list-style-type: disc; 
  margin-top: 4px;
}
.course-content li {
  margin-bottom: 4px;
}

/* เพิ่มฟอนต์ที่ดูสะอาดตาขึ้น */
.text-h5, .text-h6, .text-subtitle1 {
  letter-spacing: 0.01em;
  color: #2c2c2c;
}
</style>