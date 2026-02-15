<template>
  <q-page padding>
    <div class="row q-mb-md justify-between items-center">
      <div class="text-h5">Users Management</div>
      <q-btn label="Add User" color="primary" icon="add" @click="openDialog()" />
    </div>

    <q-table title="All Users" :rows="store.users" :columns="columns" row-key="id">
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn flat round color="primary" icon="edit" @click="openDialog(props.row)" />
          <q-btn flat round color="negative" icon="delete" @click="confirmDelete(props.row.id)" />
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="showDialog">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">{{ isEditMode ? 'Edit User' : 'New User' }}</div>
        </q-card-section>

        <q-card-section>
          <q-input v-model="form.firstName" label="First Name" autofocus />
          <q-input v-model="form.lastName" label="Last Name" />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn flat label="Save" color="primary" @click="onSubmit" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { useUserStore, type User } from 'src/stores/user-store';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const store = useUserStore();

// --- Table Configuration ---
const columns = [
  { name: 'id', label: 'ID', field: 'id', align: 'left' },
  { name: 'firstName', label: 'First Name', field: 'firstName', align: 'left' },
  { name: 'lastName', label: 'Last Name', field: 'lastName', align: 'left' },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'center' },
] as any;

// --- Form & Dialog State ---
const showDialog = ref(false);
const isEditMode = ref(false);
const editId = ref<number | null>(null);

const form = reactive({
  firstName: '',
  lastName: '',
});

// โหลดข้อมูลเมื่อเข้าหน้าเว็บ
onMounted(() => {
  void store.fetchUsers();
});

// เปิด Dialog (รองรับทั้ง Add และ Edit)
const openDialog = (user?: User) => {
  if (user) {
    // Edit Mode
    isEditMode.value = true;
    editId.value = user.id;
    form.firstName = user.firstName;
    form.lastName = user.lastName;
  } else {
    // Add Mode
    isEditMode.value = false;
    editId.value = null;
    form.firstName = '';
    form.lastName = '';
  }
  showDialog.value = true;
};

// บันทึกข้อมูล
const onSubmit = async () => {
  try {
    if (isEditMode.value && editId.value) {
      await store.updateUser(editId.value, form);
      $q.notify({ type: 'positive', message: 'User updated successfully' });
    } else {
      await store.createUser(form);
      $q.notify({ type: 'positive', message: 'User created successfully' });
    }
    showDialog.value = false;
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error saving data' });
  }
};

// ลบข้อมูล
const confirmDelete = (id: number) => {
  $q.dialog({
    title: 'Confirm',
    message: 'Are you sure you want to delete this user?',
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await store.deleteUser(id);
      $q.notify({ type: 'positive', message: 'User deleted' });
    } catch (error) {
      $q.notify({ type: 'negative', message: 'Error deleting' });
    }
  });
};
</script>
