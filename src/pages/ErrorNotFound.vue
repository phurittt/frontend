<template>
  <div class="fullscreen flex flex-center bg-light text-center q-pa-md">
    <div class="content-wrapper">
      <div class="error-code text-weight-bolder q-mb-sm">404</div>

      <h2 class="text-h4 text-weight-bold text-dark-grey q-mt-none q-mb-md">
        Oops! Page Not Found.
      </h2>

      <p class="text-body1 text-grey-6 q-mb-xl description-text mx-auto">
        The page you are looking for might have been removed, had its name changed, or is
        temporarily unavailable.
      </p>

      <q-btn
        class="btn-main text-weight-bold q-px-xl q-py-sm"
        unelevated
        rounded
        to="/"
        icon="west"
        label="Back to Home"
        no-caps
      />
    </div>
  </div>
</template>

<script setup lang="ts">
//
</script>

<style scoped lang="scss">
/* ================= Background ================= */
.bg-light {
  background-color: $background;
}

/* ================= 404 Text Design ================= */
.error-code {
  font-size: 160px;
  line-height: 1.1;
  background: linear-gradient(135deg, #e91e63, #ff8a80);

  /* Selection Disabled */
  user-select: none; /* Standard */
  -webkit-user-select: none; /* Safari, Chrome, Edge */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* IE 10+ */

  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  /* Animation & Effects */
  filter: drop-shadow(0px 10px 20px rgba(233, 30, 99, 0.15));
  animation: float 4s ease-in-out infinite;

  /* ทำให้กดค้างแล้วไม่ขึ้นเมนู Copy ในมือถือ */
  -webkit-touch-callout: none;
}

/* ================= Typography ================= */
.text-dark-grey {
  color: #3b3b3b;
}

.description-text {
  max-width: 450px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
}

/* ================= Button Style ================= */
.btn-main {
  background: linear-gradient(135deg, #e91e63, #ff8a80) !important;
  color: white !important;
  font-size: 1.05rem;
  box-shadow: 0 4px 15px rgba(233, 30, 99, 0.3);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);

  &:hover {
    box-shadow: 0 6px 20px rgba(233, 30, 99, 0.4);
    transform: translateY(-3px);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 10px rgba(233, 30, 99, 0.2);
  }
}

/* ================= Animation ================= */
@keyframes float {
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-15px);
  }
  100% {
    transform: translateY(0px);
  }
}

/* ================= Responsive Adjustments ================= */
@media (max-width: 600px) {
  .error-code {
    font-size: 110px;
  }
  .text-h4 {
    font-size: 1.5rem;
  }
  .description-text {
    font-size: 0.95rem;
    padding: 0 16px;
  }
}
</style>
