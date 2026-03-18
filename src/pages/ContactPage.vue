<script setup lang="ts">
import { useQuasar, copyToClipboard } from 'quasar';

const $q = useQuasar();
const contactEmail = 'bucctraining@buu.ac.th';

const copyEmail = () => {
  copyToClipboard(contactEmail).then(() => {
    $q.notify({
      message: 'คัดลอกอีเมลแล้ว',
      color: 'positive',
      icon: 'content_copy',
      position: 'top',
      timeout: 2000,
    });
  });
};
</script>

<template>
  <q-page class="bg-slate-50 flex justify-center q-pt-lg q-pb-xl">
    <div class="container-width q-px-md">
      <div class="bento-grid fade-up">
        <div class="bento-box bento-intro justify-center relative-position q-pa-xl overflow-hidden">
          <q-icon
            name="campaign"
            class="watermark-hero text-white opacity-10 pointer-events-none"
            size="240px"
          />

          <div class="z-top relative-position q-pl-lg">
            <h1
              class="text-h2 text-weight-bolder text-white q-mt-none q-mb-md tracking-tight line-height-tight"
            >
              ติดต่อเรา
            </h1>

            <div
              class="text-h6 text-grey-4 line-height-relaxed text-weight-medium"
              style="max-width: 90%"
            >
              สำนักคอมพิวเตอร์ มหาวิทยาลัยบูรพา
            </div>
          </div>
        </div>

        <div
          class="bento-box bento-address background-white flex column justify-between relative-position overflow-hidden"
        >
          <q-icon name="explore" class="watermark-icon text-pink-1" size="140px" />

          <div class="row items-center justify-between q-mb-md z-top">
            <div class="text-overline text-pink-5 text-weight-bolder tracking-wide">LOCATION</div>
            <q-avatar size="36px" color="pink-50" text-color="pink-5"
              ><q-icon name="place" size="18px"
            /></q-avatar>
          </div>

          <div class="z-top q-mt-auto">
            <h3 class="text-h6 text-weight-bolder text-dark q-my-none line-height-relaxed">
              169 ถนนลงหาดบางแสน<br />
              ต.แสนสุข อ.เมือง<br />
              จ.ชลบุรี 20131
            </h3>
          </div>
        </div>

        <div
          class="bento-box bento-phone background-white flex column justify-between relative-position overflow-hidden"
        >
          <q-icon name="eva-phone-call" class="watermark-icon text-blue-1" size="140px" />

          <div class="row items-center justify-between q-mb-md z-top">
            <div class="text-overline text-blue-5 text-weight-bolder tracking-wide">CONTACT US</div>
            <q-avatar size="36px" color="blue-50" text-color="blue-5"
              ><q-icon name="support_agent" size="18px"
            /></q-avatar>
          </div>

          <div class="column q-gutter-y-sm z-top q-mt-auto w-full">
            <div class="row items-center justify-between full-width">
              <span class="text-body2 text-grey-6 text-weight-bold">โทรศัพท์</span>
              <span class="text-body1 text-dark text-weight-bolder">(038) - 102761</span>
            </div>
            <div class="row items-center justify-between full-width">
              <span class="text-body2 text-grey-6 text-weight-bold">โทรศัพท์</span>
              <span class="text-body1 text-dark text-weight-bolder">(038) - 394394</span>
            </div>
            <q-separator class="q-my-sm opacity-50" />
            <div class="row items-center justify-between full-width">
              <span class="text-body2 text-grey-6 text-weight-bold">โทรสาร</span>
              <span class="text-body1 text-dark text-weight-bolder">(038) - 393464</span>
            </div>
          </div>
        </div>

        <div
          class="bento-box bento-online background-white flex column justify-between relative-position overflow-hidden"
        >
          <q-icon name="wifi_tethering" class="watermark-icon text-teal-1" size="140px" />

          <div class="row items-center justify-between q-mb-sm z-top">
            <div class="text-overline text-teal-5 text-weight-bolder tracking-wide">SOCIAL</div>
            <q-avatar size="36px" color="teal-50" text-color="teal-5"
              ><q-icon name="language" size="18px"
            /></q-avatar>
          </div>

          <div class="column gap-y-12 z-top q-mt-auto w-full">
            <a
              href="https://ict.buu.ac.th"
              target="_blank"
              class="online-btn bg-red-50 text-red-7 hover-red"
            >
              <q-icon name="public" size="18px" class="q-mr-sm" /> ict.buu.ac.th
            </a>

            <div class="row q-col-gutter-sm">
              <div class="col-6">
                <q-btn
                  unelevated
                  no-caps
                  class="online-btn bg-blue-50 text-blue-7 hover-blue full-width"
                >
                  <div class="row items-center no-wrap">
                    <q-icon name="email" size="18px" class="q-mr-sm" />
                    <span>อีเมล</span>
                  </div>

                  <q-menu
                    class="shadow-10 nav-dropdown"
                    transition-show="jump-down"
                    transition-hide="jump-up"
                    fit
                  >
                    <q-list min-width="220px">
                      <q-item
                        clickable
                        v-close-popup
                        tag="a"
                        target="_blank"
                        class="dropdown-item"
                        :href="`https://mail.google.com/mail/?view=cm&fs=1&to=${contactEmail}`"
                      >
                        <q-item-section avatar>
                          <q-icon
                            name="img:https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg"
                            size="xs"
                          />
                        </q-item-section>
                        <q-item-section>ส่งผ่าน Gmail (Browser)</q-item-section>
                      </q-item>

                      <q-item
                        clickable
                        v-close-popup
                        tag="a"
                        class="dropdown-item"
                        :href="`mailto:${contactEmail}`"
                      >
                        <q-item-section avatar>
                          <q-icon name="launch" color="grey-7" size="xs" />
                        </q-item-section>
                        <q-item-section>เปิดโปรแกรมส่งอีเมล</q-item-section>
                      </q-item>

                      <q-separator class="q-my-xs q-mx-md horizon-line" />

                      <q-item clickable v-close-popup @click="copyEmail" class="dropdown-item">
                        <q-item-section avatar>
                          <q-icon name="content_copy" color="grey-7" size="xs" />
                        </q-item-section>
                        <q-item-section>คัดลอกที่อยู่อีเมล</q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-btn>
              </div>
              <div class="col-6">
                <a
                  href="https://www.facebook.com/computerburapha"
                  target="_blank"
                  class="online-btn bg-blue-50 text-blue-7 hover-blue full-height"
                >
                  <q-icon name="facebook" size="18px" class="q-mr-sm" /> Facebook
                </a>
              </div>
            </div>
          </div>
        </div>

        <div class="bento-box bento-map background-white p-0 relative-position">
          <div
            class="map-badge background-white shadow-soft text-dark text-weight-bolder flex items-center q-px-md q-py-sm"
          >
            <div class="status-dot q-mr-sm"></div>
            แผนที่การเดินทาง
          </div>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7766.180474837852!2d100.9199820529915!3d13.282301260411797!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3102b4e87f05dc7f%3A0xcb7911f278f61c67!2zQ29tcHV0ZXIgQ2VudGVyIEJ1cmFwaGEgVW5pdmVyc2l0eSDguKrguLPguJnguLHguIHguITguK3guKHguJ7guLTguKfguYDguJXguK3guKPguYw!5e0!3m2!1sen!2sth!4v1773679770918!5m2!1sen!2sth"
            width="100%"
            height="100%"
            class="bento-iframe"
            allowfullscreen="true"
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
          >
          </iframe>
        </div>
      </div>
    </div>
  </q-page>
</template>

<style scoped lang="scss">
/* ================= Base Settings ================= */
.bg-slate-50 {
  background-color: #f1f5f9;
  min-height: 100vh;
}
.container-width {
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
}
.w-full {
  width: 100%;
  max-width: 100%;
}
.z-top {
  z-index: 10;
}
.tracking-tight {
  letter-spacing: -0.5px;
}
.tracking-wide {
  letter-spacing: 1px;
}
.line-height-tight {
  line-height: 1.2;
}
.line-height-relaxed {
  line-height: 1.6;
}
.pointer-events-none {
  pointer-events: none;
}
.text-shadow {
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}
.background-white {
  background-color: #fafafa;
}
.gap-y-12 {
  gap: 12px;
}
/* ================= TRUE BENTO GRID SYSTEM ================= */
.bento-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 260px);
  gap: 24px;
}

.bento-intro {
  grid-column: 1 / 3;
  grid-row: 1 / 2;
}
.bento-address {
  grid-column: 3 / 4;
  grid-row: 1 / 2;
}
.bento-map {
  grid-column: 1 / 3;
  grid-row: 2 / 4;
}
.bento-phone {
  grid-column: 3 / 4;
  grid-row: 2 / 3;
}
.bento-online {
  grid-column: 3 / 4;
  grid-row: 3 / 4;
}

/* ================= BENTO BOX STYLES ================= */
.bento-box {
  will-change: transform;
  border-radius: 32px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 4px 20px -5px rgba(0, 0, 0, 0.03);
  padding: 32px;
  transition:
    transform 0.3s cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  &:hover {
    transform: translateY(-4px) scale(1.01);
    box-shadow: 0 16px 32px -5px rgba(0, 0, 0, 0.08);
    border-color: #e2e8f0;

    .watermark-icon {
      transform: translate(15%, 15%) scale(1.1);
    }
  }
}

.bento-intro {
  background: linear-gradient(135deg, #424242 0%, #606060 30%, #424242 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.watermark-hero {
  position: absolute;
  right: -20px;
  bottom: -40px;
  transform: rotate(-10deg);
  z-index: 0;
  transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
.opacity-10 {
  opacity: 0.1;
}

.bento-intro:hover .watermark-hero {
  transform: rotate(0deg) scale(1.05);
}

.bg-white-transparent {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* ================= REDESIGNED ELEMENTS ================= */
.watermark-icon {
  position: absolute;
  bottom: -10px;
  right: -10px;
  transform: translate(20%, 20%);
  transition: transform 0.5s ease;
  pointer-events: none;
  z-index: 0;
}

/* Online Buttons (Mini Grid) */
.online-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  border-radius: 16px;
  text-decoration: none;
  font-weight: 700;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  border: 2px solid rgba(0, 0, 0, 0.04);
}

/* Hover States for Buttons */
.hover-red:hover {
  background-color: #a21d2e !important;
  color: white !important;
  box-shadow: 0 6px 16px rgba(162, 29, 46, 0.3);
}

.hover-blue:hover {
  background-color: #1d4ed8 !important;
  color: white !important;
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.3);
}

/* ================= MAP BOX ================= */
.bento-map {
  padding: 8px !important;
}
.bento-iframe {
  border: none;
  border-radius: 24px;
  display: block;
  filter: grayscale(10%) contrast(95%) brightness(105%);
}
.map-badge {
  position: absolute;
  top: 24px;
  right: 24px;
  border-radius: 100px;
  z-index: 10;
  font-size: 0.85rem;
}
.status-dot {
  width: 8px;
  height: 8px;
  background-color: #10b981;
  border-radius: 50%;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
}
.shadow-soft {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

/* ================= Animations ================= */
.fade-up {
  opacity: 0;
  animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeUp {
  0% {
    opacity: 0;
    transform: translateY(40px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ================= Responsive Grid ================= */
@media (max-width: 1024px) {
  .bento-grid {
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: auto;
    grid-auto-rows: minmax(260px, auto);
  }
  .bento-intro {
    grid-column: span 2;
    grid-row: auto;
  }
  .bento-map {
    grid-column: span 2;
    grid-row: auto;
    height: 450px;
  }
  .bento-address {
    grid-column: span 1;
    grid-row: auto;
  }
  .bento-phone {
    grid-column: span 1;
    grid-row: auto;
  }
  .bento-online {
    grid-column: span 2;
    grid-row: auto;
  }
}

@media (max-width: 768px) {
  .bento-grid {
    grid-template-columns: 1fr;
  }
  .bento-intro,
  .bento-address,
  .bento-map,
  .bento-phone,
  .bento-online {
    grid-column: span 1;
    grid-row: auto;
  }
  .bento-intro {
    padding: 32px 24px;
  }
  .text-h2 {
    font-size: 2.2rem !important;
  }
  .bento-map {
    height: 350px;
  }
}
</style>
