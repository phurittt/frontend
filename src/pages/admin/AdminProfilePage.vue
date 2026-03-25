<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useUserStore } from 'src/stores/user-store';
import { useCourseStore } from 'src/stores/course-store';
import type { UpdateUserRequest } from 'src/models/user';

const $q = useQuasar();
const userStore = useUserStore();
const courseStore = useCourseStore();

const tab = ref('profile');

// ─── Personal Information ──────────────────────────────────────────────────────

const profileForm = reactive({
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  department: '',
  address: '',
  province: '',
  zipcode: '',
});

const initProfileForm = () => {
  const p = userStore.profile;
  if (!p) return;
  profileForm.firstName = p.firstName || '';
  profileForm.lastName = p.lastName || '';
  profileForm.phone = p.phone || '';
  profileForm.email = p.email || '';
  profileForm.department = p.department || '';
  profileForm.address = p.address || '';
  profileForm.province = p.province || '';
  profileForm.zipcode = p.zipcode || '';
};

watch(tab, (newTab) => {
  if (newTab === 'profile') initProfileForm();
});

const isSavingProfile = ref(false);

const saveProfile = async () => {
  if (!profileForm.firstName.trim() || !profileForm.lastName.trim()) {
    $q.notify({ message: 'กรุณากรอกชื่อและนามสกุล', color: 'warning', position: 'top' });
    return;
  }
  isSavingProfile.value = true;
  try {
    const payload: UpdateUserRequest = {
      firstName: profileForm.firstName.trim(),
      lastName: profileForm.lastName.trim(),
    };
    if (profileForm.phone) payload.phone = profileForm.phone;
    if (profileForm.email) payload.email = profileForm.email;
    if (profileForm.department) payload.department = profileForm.department;
    if (profileForm.address) payload.address = profileForm.address;
    if (profileForm.province) payload.province = profileForm.province;
    if (profileForm.zipcode) payload.zipcode = profileForm.zipcode;
    await userStore.updateProfile(payload);
    $q.notify({
      message: 'บันทึกข้อมูลส่วนตัวสำเร็จ',
      color: 'positive',
      icon: 'check_circle',
      position: 'top',
    });
  } catch {
    $q.notify({ message: 'เกิดข้อผิดพลาดในการบันทึก', color: 'negative', position: 'top' });
  } finally {
    isSavingProfile.value = false;
  }
};

// ─── Favorite Courses ──────────────────────────────────────────────────────────

const favoriteCourses = computed(() =>
  courseStore.courses.filter((c) => courseStore.favoriteIds.includes(c.id)),
);

watch(tab, async (newTab) => {
  if (newTab === 'favorites' && courseStore.courses.length === 0) {
    await courseStore.fetchCourses();
  }
});

const removeFavorite = (courseId: number) => {
  courseStore.toggleFavorite(courseId);
};

onMounted(() => {
  initProfileForm();
});
</script>

<template>
  <q-page class="q-pb-xl">
    <div class="text-h6 text-weight-bold q-mb-md">โปรไฟล์ของฉัน</div>

    <q-card flat bordered class="bg-white" style="border-radius: 12px; overflow: hidden">
      <q-tabs
        v-model="tab"
        dense
        class="text-grey-7 bg-white q-pt-sm"
        active-color="primary"
        indicator-color="primary"
        align="left"
        narrow-indicator
      >
        <q-tab
          name="profile"
          icon="person"
          label="ข้อมูลส่วนตัว"
          class="text-weight-bold q-px-lg"
        />
        <q-tab
          name="favorites"
          icon="favorite"
          label="หลักสูตรที่ชอบ"
          class="text-weight-bold q-px-lg"
        >
          <q-badge v-if="courseStore.favoriteIds.length > 0" color="red-5" floating>
            {{ courseStore.favoriteIds.length }}
          </q-badge>
        </q-tab>
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="tab" animated class="bg-white">
        <!-- Personal Information Tab -->
        <q-tab-panel name="profile" class="q-pa-lg">
          <div class="text-subtitle1 text-weight-bold q-mb-lg">ข้อมูลส่วนตัว</div>

          <div class="row q-col-gutter-md" style="max-width: 680px">
            <!-- Avatar -->
            <div class="col-12 q-mb-sm">
              <div class="row items-center q-gutter-md">
                <q-avatar size="72px" class="shadow-2">
                  <img
                    :src="
                      userStore.profile?.profilePicture ||
                      'https://cdn.quasar.dev/img/boy-avatar.png'
                    "
                  />
                </q-avatar>
                <div>
                  <div class="text-subtitle1 text-weight-bold text-dark">
                    {{ userStore.profile?.firstName }} {{ userStore.profile?.lastName }}
                  </div>
                  <div class="text-caption text-grey-6">@{{ userStore.profile?.username }}</div>
                  <q-chip
                    dense
                    size="sm"
                    :color="userStore.profile?.role === 'admin' ? 'deep-purple-2' : 'orange-2'"
                    :text-color="userStore.profile?.role === 'admin' ? 'deep-purple-9' : 'orange-9'"
                    class="q-mt-xs text-weight-bold"
                  >
                    {{ userStore.profile?.role === 'admin' ? 'ผู้ดูแลระบบ' : 'เจ้าหน้าที่' }}
                  </q-chip>
                </div>
              </div>
            </div>

            <q-separator class="col-12 q-my-sm" />

            <div class="col-12 col-sm-6">
              <div class="text-caption text-weight-bold text-grey-7 q-mb-xs">
                ชื่อ <span class="text-negative">*</span>
              </div>
              <q-input outlined dense v-model="profileForm.firstName" placeholder="ชื่อ" />
            </div>
            <div class="col-12 col-sm-6">
              <div class="text-caption text-weight-bold text-grey-7 q-mb-xs">
                นามสกุล <span class="text-negative">*</span>
              </div>
              <q-input outlined dense v-model="profileForm.lastName" placeholder="นามสกุล" />
            </div>
            <div class="col-12 col-sm-6">
              <div class="text-caption text-weight-bold text-grey-7 q-mb-xs">เบอร์โทรศัพท์</div>
              <q-input outlined dense v-model="profileForm.phone" placeholder="0xx-xxx-xxxx">
                <template #prepend><q-icon name="phone" size="16px" color="grey-5" /></template>
              </q-input>
            </div>
            <div class="col-12 col-sm-6">
              <div class="text-caption text-weight-bold text-grey-7 q-mb-xs">อีเมล</div>
              <q-input
                outlined
                dense
                v-model="profileForm.email"
                placeholder="example@email.com"
                type="email"
              >
                <template #prepend><q-icon name="email" size="16px" color="grey-5" /></template>
              </q-input>
            </div>
            <div class="col-12">
              <div class="text-caption text-weight-bold text-grey-7 q-mb-xs">หน่วยงาน / องค์กร</div>
              <q-input outlined dense v-model="profileForm.department" placeholder="ชื่อหน่วยงาน">
                <template #prepend><q-icon name="business" size="16px" color="grey-5" /></template>
              </q-input>
            </div>
            <div class="col-12">
              <div class="text-caption text-weight-bold text-grey-7 q-mb-xs">ที่อยู่</div>
              <q-input
                outlined
                dense
                v-model="profileForm.address"
                placeholder="บ้านเลขที่ ถนน ตำบล อำเภอ"
              >
                <template #prepend><q-icon name="home" size="16px" color="grey-5" /></template>
              </q-input>
            </div>
            <div class="col-12 col-sm-8">
              <div class="text-caption text-weight-bold text-grey-7 q-mb-xs">จังหวัด</div>
              <q-input outlined dense v-model="profileForm.province" placeholder="จังหวัด" />
            </div>
            <div class="col-12 col-sm-4">
              <div class="text-caption text-weight-bold text-grey-7 q-mb-xs">รหัสไปรษณีย์</div>
              <q-input
                outlined
                dense
                v-model="profileForm.zipcode"
                placeholder="xxxxx"
                maxlength="5"
              />
            </div>

            <div class="col-12 q-mt-sm">
              <q-btn
                unelevated
                color="primary"
                icon="save"
                label="บันทึกข้อมูล"
                no-caps
                class="text-weight-bold q-px-xl"
                :loading="isSavingProfile"
                @click="saveProfile"
              />
            </div>
          </div>
        </q-tab-panel>

        <!-- Favorite Courses Tab -->
        <q-tab-panel name="favorites" class="q-pa-lg">
          <div class="text-subtitle1 text-weight-bold q-mb-lg">หลักสูตรที่ชอบ</div>

          <div v-if="courseStore.isLoading" class="text-center q-py-xl">
            <q-spinner-dots color="primary" size="48px" />
          </div>

          <div v-else-if="favoriteCourses.length === 0" class="text-center q-py-xl text-grey-6">
            <q-icon name="favorite_border" size="64px" class="q-mb-md opacity-50" />
            <div class="text-h6">ยังไม่มีหลักสูตรที่ชอบ</div>
            <div class="text-caption q-mt-sm">กดไอคอนหัวใจที่หน้าหลักสูตรเพื่อเพิ่มที่นี่</div>
          </div>

          <div v-else class="row q-col-gutter-lg">
            <div
              v-for="course in favoriteCourses"
              :key="course.id"
              class="col-12 col-md-6 col-lg-4"
            >
              <q-card bordered flat class="favorite-card column" style="border-radius: 12px">
                <q-img
                  :src="course.image || 'https://cdn.quasar.dev/img/parallax2.jpg'"
                  :ratio="16 / 9"
                  style="border-radius: 12px 12px 0 0"
                >
                  <div class="absolute-top-right q-pa-sm">
                    <q-btn
                      round
                      unelevated
                      size="sm"
                      color="red-1"
                      text-color="red-7"
                      icon="favorite"
                      @click="removeFavorite(course.id)"
                    >
                      <q-tooltip>นำออกจากรายการชอบ</q-tooltip>
                    </q-btn>
                  </div>
                </q-img>

                <q-card-section class="col column justify-between q-pa-md">
                  <div>
                    <div
                      class="text-subtitle1 text-weight-bold line-height-tight q-mb-sm ellipsis-2-lines"
                    >
                      {{ course.title }}
                    </div>
                    <div class="text-caption text-grey-6 flex items-center q-mb-xs">
                      <q-icon name="event" size="13px" class="q-mr-xs" /> {{ course.date }}
                    </div>
                    <div class="text-caption text-grey-6 flex items-center q-mb-xs">
                      <q-icon name="location_on" size="13px" class="q-mr-xs" />
                      {{ course.location }}
                    </div>
                    <div class="text-caption text-grey-6 flex items-center q-mb-md">
                      <q-icon name="schedule" size="13px" class="q-mr-xs" /> {{ course.duration }}
                    </div>
                  </div>
                  <div class="row items-center justify-between">
                    <q-chip
                      dense
                      size="sm"
                      :color="course.price === 0 ? 'green-1' : 'blue-1'"
                      :text-color="course.price === 0 ? 'green-8' : 'blue-8'"
                      class="text-weight-bold"
                    >
                      {{ course.price === 0 ? 'ฟรี' : `${course.price.toLocaleString()} บาท` }}
                    </q-chip>
                    <q-btn
                      unelevated
                      size="sm"
                      color="primary"
                      label="ดูรายละเอียด"
                      no-caps
                      class="text-weight-bold q-px-md"
                      :to="`/courses/${course.id}`"
                    />
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
  </q-page>
</template>

<style scoped>
.line-height-tight {
  line-height: 1.3;
}
.favorite-card {
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}
.favorite-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}
</style>
