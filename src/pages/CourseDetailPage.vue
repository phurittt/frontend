<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { useCourseStore } from 'src/stores/course-store';
import { useAuthStore } from 'src/stores/auth-store'; // นำเข้า Auth Store
import { computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';

const route = useRoute();
const router = useRouter();
const store = useCourseStore();
const authStore = useAuthStore();
const $q = useQuasar();

onMounted(() => {
  if (store.courses.length === 0) {
    store.fetchCourses();
  }
});

const course = computed(() => {
  const id = Number(route.params.id);
  if (store.courses.length === 0) return undefined;
  return store.courses.find((c) => c.id === id) || store.courses[0];
});

const formatPrice = (price?: number) => {
  if (price === undefined) return 'FREE';
  return price === 0 ? 'FREE' : `฿${price.toLocaleString()}`;
};

const isFavorite = computed(() => {
  if (!course.value) return false;
  return store.favoriteIds.includes(course.value.id);
});

const handleNotify = () => {
  $q.notify({
    message: 'เราจะแจ้งเตือนคุณเมื่อคอร์สนี้เปิดรับสมัครรอบต่อไป',
    color: 'primary',
    icon: 'mark_email_read',
    position: 'top',
  });
};


// Logic สำหรับจัดการปุ่มลงทะเบียน/Login
const buttonLabel = computed(() => {
  if (course.value?.totalSeats === course.value?.registeredSeats) {
    return 'แจ้งเตือนเมื่อเปิดรอบใหม่';
  }
  return authStore.isLoggedIn ? 'ลงทะเบียนอบรม' : 'กรุณาเข้าสู่ระบบ ก่อนลงทะเบียน';
});

const handleMainButtonClick = () => {
  if (course.value?.totalSeats === course.value?.registeredSeats) {
    handleNotify();
  } else if (!authStore.isLoggedIn) {
    // ถ้ายังไม่ Login ให้แจ้งเตือนและไปหน้า Login
    $q.notify({
      message: 'กรุณาเข้าสู่ระบบก่อนลงทะเบียน',
      color: 'warning',
      icon: 'lock',
      position: 'top',
    });
    router.push('/login'); 
  } else {
    // ถ้า Login แล้วให้ทำตามปกติ
    handleRegister();
  }
};


const handleRegister = () => {
  $q.notify({
    message: 'กำลังพาท่านเข้าสู่หน้าลงทะเบียน...',
    color: 'positive',
    icon: 'check_circle',
    position: 'top',
    timeout: 2000,
    classes: 'text-weight-medium',
  });
};

const toggleFavorite = () => {
  if (course.value) {
    store.toggleFavorite(course.value.id);

    $q.notify({
      message: isFavorite.value
        ? 'บันทึกหลักสูตรไว้เรียนภายหลังแล้ว'
        : 'นำหลักสูตรออกจากรายการที่บันทึก',
      color: isFavorite.value ? 'pink-6' : 'grey-8',
      icon: isFavorite.value ? 'favorite' : 'favorite_border',
      position: 'top',
      timeout: 2000,
      classes: 'text-weight-medium',
    });
  }
};

const addToCart = () => {
  if (course.value) {
    store.addToCart(course.value);

    $q.notify({
      message: 'เพิ่มหลักสูตรลงในรถเข็นแล้ว',
      color: 'positive',
      icon: 'shopping_cart_checkout',
      position: 'top',
      timeout: 2000,
      classes: 'text-weight-medium',
    });
  }
};
</script>

<template>
  <q-page class="bg-light-theme q-pb-xl responsive-page">
    <div v-if="store.isLoading" class="full-width">
      <div class="header-banner q-pt-xl q-pb-xl" style="background: #1e293b">
        <div class="container-width q-mx-auto q-px-md">
          <q-skeleton type="rect" width="150px" height="36px" class="q-mb-md q-mt-sm bg-grey-8" />
          <q-skeleton type="rect" width="120px" height="30px" class="q-mb-md bg-grey-8" />
          <q-skeleton type="text" width="80%" height="60px" class="q-mb-md bg-grey-8" />
          <q-skeleton type="text" width="60%" height="40px" class="q-mb-lg bg-grey-8" />

          <div class="flex items-center no-wrap instructor-box">
            <q-skeleton type="QAvatar" size="48px" class="q-mr-md bg-grey-8" />
            <div>
              <q-skeleton type="text" width="80px" class="bg-grey-8" />
              <q-skeleton type="text" width="120px" class="bg-grey-8" />
            </div>
          </div>
        </div>
      </div>

      <div class="container-width q-mx-auto q-px-md q-mt-xl">
        <div class="row q-col-gutter-lg q-col-gutter-md-xl">
          <div class="col-12 col-md-7 col-lg-8">
            <div class="row q-col-gutter-sm q-col-gutter-sm-md q-mb-lg">
              <div class="col-6 col-sm-3">
                <q-skeleton type="rect" height="100px" class="border-radius-16" />
              </div>
              <div class="col-6 col-sm-3">
                <q-skeleton type="rect" height="100px" class="border-radius-16" />
              </div>
              <div class="col-12 col-sm-6">
                <q-skeleton type="rect" height="100px" class="border-radius-16" />
              </div>
            </div>
            <q-skeleton type="rect" height="250px" class="q-mb-lg border-radius-20" />
            <q-skeleton type="rect" height="300px" class="border-radius-20" />
          </div>
          <div class="col-12 col-md-5 col-lg-4">
            <q-skeleton type="rect" height="500px" class="border-radius-20" />
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="course" class="full-width">
      <div class="header-banner text-white q-pt-xl q-pb-xl relative-position overflow-hidden">
        <div
          class="bg-image absolute-full pointer-events-none"
          :style="`background-image: url('${course?.image || 'https://via.placeholder.com/800x450'}');`"
        ></div>
        <div class="absolute-full bg-gradient-overlay pointer-events-none"></div>
        <div class="bg-pattern absolute-full opacity-10 pointer-events-none"></div>

        <div class="container-width q-mx-auto q-px-md relative-position z-top">
          <div class="q-mb-md q-mt-sm">
            <q-btn
              flat
              icon="arrow_back_ios_new"
              label="กลับไปหน้าหลักสูตร"
              text-color="white"
              no-caps
              class="q-px-sm q-pr-md text-weight-medium back-btn rounded-borders"
              to="/"
            />
          </div>

          <div class="row items-center">
            <div class="col-12 col-md-9 fade-up q-py-md">
              <q-chip
                :color="course.totalSeats === course.registeredSeats ? 'red-6' : 'pink-6'"
                text-color="white"
                size="md"
                class="text-weight-bold q-mb-md shadow-2 q-px-md disable-select"
              >
                <q-icon
                  name="fiber_manual_record"
                  size="xs"
                  class="q-mr-xs"
                  :class="
                    course.totalSeats === course.registeredSeats ? 'text-white' : 'text-green-3'
                  "
                />
                {{
                  course.totalSeats === course.registeredSeats
                    ? 'ที่นั่งเต็มแล้ว'
                    : 'กำลังเปิดรับสมัคร'
                }}
              </q-chip>

              <h1
                class="text-h3 text-weight-bolder q-mt-none q-mb-md line-height-tight text-shadow"
              >
                {{ course.title }}
              </h1>

              <p
                class="text-subtitle1 text-grey-3 ellipsis-3-lines q-mb-lg text-shadow"
                style="max-width: 800px; line-height: 1.6"
              >
                {{ course.description }}
              </p>

              <div
                class="bg-white-transparent q-py-sm q-px-md rounded-borders flex inline items-center no-wrap instructor-box disable-select"
              >
                <q-avatar size="48px" class="shadow-1 border-white q-mr-md">
                  <img :src="course.instructor.avatar" />
                </q-avatar>
                <div class="text-body2">
                  <div class="text-pink-3 text-caption text-weight-bold">
                    {{ course.instructor.role }}
                  </div>
                  <div class="text-white text-weight-bold text-subtitle2">
                    {{ course.instructor.name }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="container-width q-mx-auto q-px-md q-mt-lg">
        <div class="row q-col-gutter-lg q-col-gutter-md-xl">
          <div
            class="col-12 col-md-7 col-lg-8 column q-gutter-y-lg q-gutter-md-y-xl content-col fade-up"
            style="animation-delay: 0.1s"
          >
            <div class="row q-col-gutter-sm q-col-gutter-sm-md">
              <div class="col-6 col-sm-3">
                <q-card
                  flat
                  class="info-card bg-white q-pa-md q-pt-lg text-center disable-select flex flex-center column"
                >
                  <q-avatar
                    color="pink-1"
                    text-color="primary"
                    icon="schedule"
                    size="md"
                    class="q-mb-sm"
                  />
                  <div class="text-caption text-grey-6 text-weight-medium">ระยะเวลา</div>
                  <div class="text-weight-bold text-dark text-subtitle2">{{ course.duration }}</div>
                </q-card>
              </div>

              <div class="col-6 col-sm-3">
                <q-card
                  flat
                  class="info-card bg-white q-pa-md q-pt-lg text-center disable-select flex flex-center column"
                >
                  <q-avatar
                    color="pink-1"
                    text-color="primary"
                    icon="group"
                    size="md"
                    class="q-mb-sm"
                  />
                  <div class="text-caption text-grey-6 text-weight-medium">รับสมัคร</div>
                  <div class="text-weight-bold text-dark text-subtitle2">
                    {{ course.totalSeats }} คน
                  </div>
                </q-card>
              </div>

              <div class="col-12 col-sm-6">
                <q-card
                  flat
                  class="info-card bg-white q-pa-md q-pt-lg text-center disable-select flex flex-center column"
                >
                  <q-avatar
                    color="pink-1"
                    text-color="primary"
                    icon="place"
                    size="md"
                    class="q-mb-sm"
                  />
                  <div class="text-caption text-grey-6 text-weight-medium">สถานที่อบรม</div>
                  <div
                    class="text-weight-bold text-dark text-center line-height-tight text-subtitle2"
                  >
                    {{ course.location }}
                  </div>
                </q-card>
              </div>
            </div>

            <q-card flat class="course-card q-pa-lg q-pa-md-xl">
              <div class="text-h5 text-weight-bolder text-dark q-mb-lg flex items-center">
                สิ่งที่คุณจะได้เรียนรู้
              </div>
              <div class="row q-col-gutter-lg">
                <div
                  v-for="(objective, index) in course.objectives"
                  :key="index"
                  class="col-12 col-sm-6 row no-wrap items-start objective-item"
                >
                  <q-icon
                    name="check"
                    color="positive"
                    size="20px"
                    class="q-mr-md q-mt-xs bg-green-1 rounded-borders q-pa-xs"
                  />
                  <div class="text-body1 text-grey-8" style="line-height: 1.6">{{ objective }}</div>
                </div>
              </div>
            </q-card>

            <q-card flat class="course-card q-pa-lg q-pa-md-xl q-mb-xl">
              <div class="text-h5 text-weight-bolder text-dark q-mb-lg flex items-center">
                เนื้อหาของหลักสูตร
              </div>
              <q-list separator class="outline-list">
                <q-item
                  v-for="(outline, index) in course.courseOutline"
                  :key="index"
                  class="q-px-sm q-py-md outline-item"
                >
                  <q-item-section avatar style="min-width: 48px">
                    <q-avatar
                      color="grey-1"
                      text-color="primary"
                      size="md"
                      class="text-weight-bold shadow-1"
                    >
                      {{ index + 1 }}
                    </q-avatar>
                  </q-item-section>
                  <q-item-section class="text-body1 text-dark text-weight-medium">
                    {{ outline }}
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card>
          </div>

          <div
            class="col-12 col-md-5 col-lg-4 relative-position sidebar-col fade-up"
            style="animation-delay: 0.2s"
          >
            <div class="sticky-sidebar q-mt-sm">
              <q-card flat class="course-card overflow-hidden">
                <div class="image-wrapper relative-position">
                  <q-img
                    :src="course.image || 'https://via.placeholder.com/800x450'"
                    fit="cover"
                    class="course-img disable-select"
                    style="height: 240px; width: 100%"
                  >
                    <template v-slot:loading>
                      <q-spinner-dots color="primary" size="2em" />
                    </template>
                  </q-img>
                  <div class="absolute-bottom-right q-ma-md z-top">
                    <q-chip
                      size="lg"
                      :ripple="false"
                      :class="[
                        'text-weight-bold q-ma-none price-chip disable-select',
                        course.price === 0 ? 'price-free' : 'price-paid',
                      ]"
                      text-color="white"
                    >
                      {{ formatPrice(course.price) }}
                    </q-chip>
                  </div>
                </div>

                <q-card-section class="q-pa-lg">
                  <div
                    class="text-caption text-weight-medium text-grey-7 q-mb-sm flex justify-between items-center"
                  >
                    <span
                      >ลงทะเบียนแล้ว:
                      <strong class="text-dark"
                        >{{ course.registeredSeats }}/{{ course.totalSeats }}</strong
                      >
                    </span>
                    <q-badge
                      :color="
                        course.totalSeats - course.registeredSeats > 0
                          ? course.totalSeats - course.registeredSeats <= 5
                            ? 'negative'
                            : 'orange-14'
                          : 'red-6'
                      "
                      rounded
                      class="q-px-sm q-py-xs"
                    >
                      {{
                        course.totalSeats - course.registeredSeats > 0
                          ? `เหลือ ${course.totalSeats - course.registeredSeats} ที่นั่ง`
                          : 'ที่นั่งเต็มแล้ว'
                      }}
                    </q-badge>
                  </div>

                  <q-linear-progress
                    rounded
                    size="10px"
                    :value="course.registeredSeats / course.totalSeats"
                    color="primary"
                    track-color="pink-1"
                    class="q-mb-xl shadow-1"
                  />

                  <div class="column q-gutter-y-sm">
                    <q-btn
                      unelevated
                      :class="course.totalSeats === course.registeredSeats ? 'btn-notify' : 'btn-main'"
                        class="full-width text-weight-bold q-py-md text-subtitle1"
                      :label="buttonLabel"
                      :icon="
                        course.totalSeats === course.registeredSeats
                      ? 'notifications_active'
                      : (!authStore.isLoggedIn ? 'warning' : undefined)
                      "
                      rounded
                      no-caps
                      @click="handleMainButtonClick"
                  />

                    <div v-if="authStore.isLoggedIn" class="row q-gutter-x-sm">
                      <q-btn
                        outline
                        class="btn-outline col text-weight-bold q-py-sm"
                        color="primary"
                        icon="shopping_cart"
                        label="ใส่รถเข็น"
                        rounded
                        no-caps
                        @click="addToCart"
                      />
                      <q-btn
                        outline
                        class="btn-outline-grey text-weight-bold q-py-sm q-px-md btn-favorite"
                        :class="{ 'is-active': isFavorite }"
                        :color="isFavorite ? 'pink' : 'grey-4'"
                        :text-color="isFavorite ? 'pink' : 'dark'"
                        :icon="isFavorite ? 'favorite' : 'favorite_border'"
                        rounded
                        no-caps
                        @click="toggleFavorite"
                      >
                      </q-btn>
                    </div>
                  </div>

                  <q-separator class="q-my-lg opacity-50" />

                  <div class="text-subtitle1 text-weight-bold text-dark q-mb-sm">
                    สรุปข้อมูลการอบรม
                  </div>
                  <q-list class="q-mt-none">
                    <q-item class="q-px-none q-py-sm">
                      <q-item-section avatar style="min-width: 44px">
                        <q-avatar
                          color="pink-1"
                          text-color="primary"
                          icon="event_available"
                          size="sm"
                        />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label class="text-weight-bold text-dark">{{
                          course.date
                        }}</q-item-label>
                        <q-item-label caption class="text-grey-6">{{ course.time }}</q-item-label>
                      </q-item-section>
                    </q-item>

                    <q-item class="q-px-none q-py-sm">
                      <q-item-section avatar style="min-width: 44px">
                        <q-avatar
                          color="pink-1"
                          text-color="primary"
                          :icon="course.format.includes('ออนไลน์') ? 'laptop_mac' : 'business'"
                          size="sm"
                        />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label class="text-weight-bold text-dark"
                          >รูปแบบการเรียน</q-item-label
                        >
                        <q-item-label caption class="text-grey-6">{{ course.format }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-else
      class="container-width q-mx-auto q-px-md q-py-xl text-center flex flex-center column"
      style="min-height: 60vh"
    >
      <q-icon name="error_outline" size="100px" color="grey-4" class="q-mb-md" />
      <h2 class="text-h4 text-weight-bold text-dark q-mt-none q-mb-sm">ไม่พบหลักสูตร</h2>
      <p class="text-grey-6 text-subtitle1 q-mb-lg">
        หลักสูตรที่คุณค้นหาอาจถูกลบ หรือคุณกรอก URL ไม่ถูกต้อง
      </p>
      <q-btn
        unelevated
        color="primary"
        label="กลับไปหน้าแรก"
        to="/"
        no-caps
        rounded
        class="q-px-xl q-py-sm text-weight-bold"
      />
    </div>
  </q-page>
</template>

<style scoped lang="scss">
span {
  font-size: 13px;
}

/* ================= Skeleton Styles ================= */
.border-radius-16 {
  border-radius: 16px;
}
.border-radius-20 {
  border-radius: 20px;
}

/* ================= โทนสีและพื้นหลัง ================= */
.bg-light-theme {
  background-color: #f1f5f9;
  min-height: 100vh;
}
.container-width {
  max-width: 1200px;
  width: 100%;
}
.pointer-events-none {
  pointer-events: none;
}
.instructor-box {
  width: fit-content;
}
.line-height-tight {
  line-height: 1.3;
}
.opacity-10 {
  opacity: 0.1;
}
.opacity-50 {
  opacity: 0.5;
}
.z-top {
  z-index: 2;
}
.text-shadow {
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

/* ================= Header Banner ================= */
.header-banner {
  z-index: 2;
  background-color: $dark;
  min-height: 380px;
  display: flex;
  align-items: center;

  &:hover {
    .bg-image {
      transform: scale(1.12);
    }
  }
}
.bg-image {
  background-size: cover;
  background-position: center;
  transform: scale(1.05);
  transition: transform 1.5s cubic-bezier(0.25, 0.8, 0.25, 1);
  will-change: transform;
  backface-visibility: hidden;
}

.bg-gradient-overlay {
  background: linear-gradient(
    to right,
    rgba(15, 23, 42, 0.95) 0%,
    rgba(15, 23, 42, 0.7) 50%,
    rgba(15, 23, 42, 0.4) 100%
  );
}

.bg-pattern {
  background-image: radial-gradient(circle at 2px 2px, rgba(255, 255, 255, 0.2) 1px, transparent 0);
  background-size: 24px 24px;
}
.bg-white-transparent {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.border-white {
  border: 2px solid white;
}

/* ================= Cards ================= */
.course-card {
  border-radius: 20px;
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
}
.info-card {
  border-radius: 16px;
  border: 1px solid #f1f5f9;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  height: 100%;
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
    border-color: #e2e8f0;
  }
}

/* ================= Sidebar ================= */
.sticky-sidebar {
  z-index: 10;
}

/* ================= Image Hover Effect ================= */
.image-wrapper {
  overflow: hidden;
}
.course-img {
  transition: transform 0.8s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.course-card:hover .course-img {
  transform: scale(1.08);
}
.price-chip {
  height: 40px;
  padding: 0 16px;
  font-size: 1.05rem;
  letter-spacing: 0.3px;

  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);

  &:hover {
    transform: scale(1.05) translateY(-2px);
  }
}
.price-free {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%) !important;
}
.price-paid {
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%) !important;
}

/* ================= Lists ================= */
.objective-item {
  transition: transform 0.2s ease;
  &:hover {
    transform: translateX(4px);
  }
}
.outline-item {
  border-radius: 12px;
  transition:
    background-color 0.2s ease,
    transform 0.2s ease;
  &:hover {
    background-color: #f8fafc;
    transform: scale(1.01);
  }
}

/* ================= ปุ่มต่างๆ ================= */
.back-btn {
  background: rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
  &:hover {
    background: white;
    color: #0f172a !important;
    transform: translateX(-4px);
  }
}

.btn-main {
  font-size: 18px;
  background: linear-gradient(135deg, #e91e63) !important;
  color: white !important;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(233, 30, 99, 0.4);
  }
  &:active {
    transform: translateY(0);
  }
}

.btn-notify {
  background: #3b82f6 !important;
  color: white !important;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(59, 130, 246, 0.3);
  }
}

.btn-outline {
  transition: all 0.2s ease;
  background-color: white;
  &:hover {
    background-color: #fff0f5 !important;
  }
}

.btn-outline-grey {
  transition: all 0.2s ease;
  &:hover {
    background-color: #f8fafc !important;
    border-color: #cbd5e1 !important;
  }
}

/* ================= Animations ================= */
.fade-up {
  opacity: 0;
  animation: fadeUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeUp {
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes heartPop {
  0% {
    transform: scale(1);
  }
  25% {
    transform: scale(0.85);
  }
  50% {
    transform: scale(1.35);
  }
  75% {
    transform: scale(0.95);
  }
  100% {
    transform: scale(1);
  }
}

.btn-favorite {
  transition: all 0.3s ease;
}

.btn-favorite.is-active :deep(.q-icon) {
  animation: heartPop 0.5s ease-in-out forwards;
}

/* ================= Responsive ================= */
@media (max-width: 1023px) {
  .sidebar-col {
    order: -1;
  }
  .sticky-sidebar {
    position: static;
  }
}

@media (max-width: 768px) {
  .q-pa-md-xl {
    padding: 24px;
  }
  .text-h3 {
    font-size: 2.2rem;
  }
  .info-card {
    padding: 16px 12px;
  }

  .header-banner {
    min-height: auto;
    padding-top: 32px;
    padding-bottom: 40px;
  }
  .q-mt-xl {
    margin-top: 24px;
  }
}

@media (max-width: 480px) {
  .course-card {
    border-radius: 20px;
  }
  .text-h3 {
    font-size: 1.8rem;
  }
}
</style>
