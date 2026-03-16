<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useCourseStore } from 'src/stores/course-store';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const store = useCourseStore();
const router = useRouter();
const filterGroup = ref('ทุกหมวดหมู่');
const sortOrder = ref('จัดเรียงตามวันที่');

const userLayout = ref('grid');

const displayLayout = computed(() => {
  return $q.screen.xs ? 'grid' : userLayout.value;
});

onMounted(() => {
  store.fetchCourses();
});

const goToDetail = (id: number) => {
  router.push(`/courses/${id}`).then(() => {
    window.scrollTo(0, 0);
  });
};

const formatPrice = (price: number) => {
  return price === 0 ? 'FREE' : `฿${price.toLocaleString()}`;
};
</script>

<template>
  <q-page class="q-pa-md q-pb-xl bg-light-theme responsive-page">
    <div class="container-width q-mx-auto">
      <div class="row items-center justify-between q-mb-lg fade-up">
        <h2 class="section-title text-weight-bold text-dark q-my-none">หลักสูตรทั้งหมด</h2>
      </div>

      <div
        class="filter-bar row wrap items-center q-gutter-sm q-mb-lg q-py-sm rounded-borders fade-up"
        style="animation-delay: 0.1s"
      >
        <q-btn-dropdown
          unelevated
          label="ทุกหมวดหมู่"
          color="white"
          text-color="dark"
          no-caps
          class="filter-btn text-weight-medium"
        />
        <q-btn-dropdown
          unelevated
          label="จัดเรียงตามวันที่"
          color="white"
          text-color="dark"
          no-caps
          class="filter-btn text-weight-medium"
        />

        <q-space />

        <div class="row q-gutter-xs gt-xs">
          <q-btn
            unelevated
            round
            icon="grid_view"
            :class="userLayout === 'grid' ? 'bg-dark text-white' : 'bg-white text-grey-6'"
            @click="userLayout = 'grid'"
            size="sm"
            class="shadow-1"
          />
          <q-btn
            unelevated
            round
            icon="view_list"
            :class="userLayout === 'list' ? 'bg-dark text-white' : 'bg-white text-grey-6'"
            @click="userLayout = 'list'"
            size="sm"
            class="shadow-1"
          />
        </div>
      </div>

      <div v-if="store.isLoading" class="row justify-center q-py-xl">
        <q-spinner-dots size="50px" color="primary" />
      </div>

      <div v-else class="fade-up" style="animation-delay: 0.2s">
        <div v-if="displayLayout === 'grid'" class="row q-col-gutter-lg">
          <div
            v-for="course in store.courses"
            :key="course.id"
            class="col-12 col-sm-6 col-md-4 col-lg-3"
          >
            <q-card flat class="course-card column full-height" @click="goToDetail(course.id)">
              <div class="image-wrapper relative-position">
                <q-img v-if="course.image" :src="course.image" class="course-img" fit="cover" />
                <div v-else class="bg-grey-2 flex flex-center course-img">
                  <q-icon name="collections" size="50px" color="grey-4" />
                </div>
                <div class="glass-badge absolute-top-left q-ma-sm">
                  <q-icon name="timer" size="14px" class="q-mr-xs text-dark" />
                  {{ course.duration }}
                </div>
                <div
                  class="price-badge absolute-top-right q-ma-sm"
                  :class="course.price === 0 ? 'price-free' : 'price-paid'"
                >
                  {{ formatPrice(course.price) }}
                </div>
              </div>
              <q-card-section class="col q-pa-md column">
                <div
                  class="text-subtitle1 text-weight-bold text-dark q-mb-xs card-title ellipsis-2-lines"
                >
                  {{ course.title }}
                </div>
                <div class="text-body2 text-grey-6 q-mb-md flex-grow-1 ellipsis-3-lines">
                  {{ course.description }}
                </div>
                <div class="course-info-list q-gutter-y-sm q-mb-md">
                  <div class="row items-center text-caption text-grey-8 no-wrap">
                    <q-icon name="event" size="16px" class="q-mr-xs text-primary" />
                    <span class="ellipsis">{{ course.date }} • {{ course.time }}</span>
                  </div>
                  <div class="row items-center text-caption text-grey-8 no-wrap">
                    <q-icon
                      :name="course.format.includes('ออนไลน์') ? 'laptop_mac' : 'business'"
                      size="16px"
                      class="q-mr-xs text-primary"
                    />
                    <span class="ellipsis">{{ course.format }}</span>
                  </div>
                </div>
                <q-btn
                  unelevated
                  class="full-width text-weight-bold"
                  :class="
                    course.totalSeats === course.registeredSeats ? 'btn-soldout' : 'btn-detail'
                  "
                  :label="
                    course.totalSeats === course.registeredSeats
                      ? 'ที่นั่งเต็มแล้ว'
                      : 'ดูรายละเอียด'
                  "
                  no-caps
                />
              </q-card-section>
            </q-card>
          </div>
        </div>

        <div v-else class="column q-gutter-y-md">
          <div
            v-for="course in store.courses"
            :key="course.id"
            class="course-card-list row no-wrap bg-white shadow-sm overflow-hidden cursor-pointer"
            @click="goToDetail(course.id)"
          >
            <div class="list-img-box relative-position">
              <q-img
                v-if="course.image"
                :src="course.image"
                class="full-height course-img"
                fit="cover"
              />
              <div v-else class="bg-grey-2 flex flex-center full-height course-img">
                <q-icon name="collections" size="40px" color="grey-4" />
              </div>
              <div class="glass-badge absolute-top-left q-ma-sm">
                <q-icon name="timer" size="14px" class="q-mr-xs text-dark" />
                {{ course.duration }}
              </div>
            </div>

            <q-card-section class="col q-pa-lg column justify-center">
              <div class="row items-center q-mb-sm">
                <q-chip
                  outline
                  color="primary"
                  size="sm"
                  class="text-weight-medium q-mr-sm q-ml-none"
                >
                  {{ course.format }}
                </q-chip>
                <div class="text-caption text-grey-6">{{ course.location }}</div>
              </div>
              <div class="text-h6 text-weight-bold text-dark q-mb-xs">{{ course.title }}</div>
              <div class="text-body2 text-grey-6 ellipsis-2-lines q-mb-md">
                {{ course.description }}
              </div>

              <div class="row q-gutter-x-md items-center">
                <div class="text-caption text-grey-8 flex items-center">
                  <q-icon name="event" size="16px" class="q-mr-xs text-primary" /> {{ course.date }}
                </div>
                <div class="text-caption text-grey-8 flex items-center">
                  <q-icon name="schedule" size="16px" class="q-mr-xs text-primary" />
                  {{ course.time }}
                </div>
              </div>
            </q-card-section>

            <div
              class="list-action-zone column justify-center items-center q-pa-xl bg-slate-50 border-left-dashed"
            >
              <div
                class="text-h5 text-weight-bolder q-mb-sm"
                :class="course.price === 0 ? 'text-positive' : 'text-primary'"
              >
                {{ formatPrice(course.price) }}
              </div>
              <div class="text-caption text-grey-6 q-mb-lg">
                เปิดรับสมัคร {{ course.totalSeats }} ท่าน
              </div>
              <q-btn unelevated color="dark" label="ดูรายละเอียด" no-caps rounded class="q-px-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<style scoped lang="scss">
.bg-light-theme {
  background-color: $background;
  min-height: 100vh;
}
.container-width {
  max-width: 1280px;
}
.flex-grow-1 {
  flex-grow: 1;
}
.section-title {
  font-size: clamp(1.4rem, 2.5vw, 1.8rem);
}

/* ================= Filter Bar ================= */
.filter-btn {
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
  transition: all 0.2s ease;
  font-size: 0.9rem;
  &:hover {
    border-color: #cbd5e1;
    background-color: #f8fafc !important;
  }
}

/* ================= แบบ GRID ================= */
.course-card {
  border-radius: 16px;
  background: white;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  overflow: hidden;
  cursor: pointer;
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05) !important;
    .course-img {
      transform: scale(1.05);
    }
  }
}
.image-wrapper {
  height: 180px;
  overflow: hidden;
}
.course-img {
  height: 100%;
  width: 100%;
  transition: transform 0.6s ease;
}
.card-title {
  min-height: 56px;
  margin-bottom: 10px;
}

/* ================= แบบ LIST (Desktop & Tablet เท่านั้น) ================= */
.course-card-list {
  border-radius: 20px;
  transition: all 0.3s ease;
  &:hover {
    transform: translateX(8px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
    .list-action-zone {
      background-color: #fff;
    }
    .course-img {
      transform: scale(1.05);
    }
  }
}
.list-img-box {
  width: 280px;
  min-width: 280px;
  overflow: hidden;
}
.list-action-zone {
  min-width: 220px;
  text-align: center;
  transition: background-color 0.3s ease;
}
.border-left-dashed {
  border-left: 1px dashed #e2e8f0;
}

/* Badges & Elements */
.glass-badge {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(4px);
  color: #1e293b;
  padding: 4px 10px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.75rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
.price-badge {
  padding: 4px 12px;
  border-radius: 12px;
  color: white;
  font-weight: bold;
  font-size: 0.8rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}
.price-free {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%) !important;
}
.price-paid {
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%) !important;
}

/* Buttons */
.btn-detail {
  background-color: #f8fafc;
  color: #334155;
  border-radius: 10px;
  padding: 8px 0;
  font-size: 0.95rem;
  border: 1px solid #e2e8f0;
  &:hover {
    background: #f1f5f9;
    color: $primary;
    border-color: #cbd5e1;
  }
}
.btn-soldout {
  background-color: #fee2e2;
  color: #ef4444;
  border-radius: 10px;
  padding: 8px 0;
  border: 1px solid #fecaca;
}

/* Animations */
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

/* Responsive */
@media (max-width: 1023px) and (min-width: 600px) {
  .list-img-box {
    width: 220px;
    min-width: 220px;
  }
  .list-action-zone {
    min-width: 180px;
    padding: 24px !important;
  }
}
</style>
