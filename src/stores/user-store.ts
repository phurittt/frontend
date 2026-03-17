import { acceptHMRUpdate, defineStore } from 'pinia';
import type { UserProfile } from 'src/models/user';

export const useUserStore = defineStore('user', {
  state: () => ({
    profile: null as UserProfile | null,
    usersList: [] as UserProfile[],
  }),

  actions: {
    $reset() {
      this.profile = null;
      this.usersList = [];
    },

    fetchUsers() {
      // โหลดข้อมูลจำลองแค่ครั้งแรกเท่านั้น
      if (this.usersList.length > 0) return;
      this.usersList = [
        {
          id: '1',
          username: 'natty',
          email: 'natty@example.com',
          title: 'นาย',
          firstNameTh: 'นธี',
          lastNameTh: 'กว้างใหญ่',
          phone: '0800000001',
          province: 'กรุงเทพมหานคร',
          organization: 'สำนักคอมพิวเตอร์',
          avatar: '',
          role: 'staff',
        },
        {
          id: '2',
          username: 'kilen',
          email: 'kilen@example.com',
          title: 'นาย',
          firstNameTh: 'กิเลน',
          lastNameTh: 'กลิ่นดิน',
          phone: '0800000002',
          province: 'กรุงเทพมหานคร',
          organization: 'สำนักคอมพิวเตอร์',
          avatar: '',
          role: 'admin',
        },
        {
          id: '3',
          username: 'james',
          email: 'james@example.com',
          title: 'นาย',
          firstNameTh: 'เจม',
          lastNameTh: 'วาน',
          phone: '0800000003',
          province: 'กรุงเทพมหานคร',
          organization: 'สำนักคอมพิวเตอร์',
          avatar: '',
          role: 'student',
        },
        {
          id: '4',
          username: 'michael_j',
          email: 'michael.j@example.com',
          title: 'นาย',
          firstNameTh: 'ไมเคิล',
          lastNameTh: 'ใจดี',
          phone: '0812345670',
          province: 'เชียงใหม่',
          organization: 'คณะวิศวกรรมศาสตร์',
          avatar: '',
          role: 'student',
        },
        {
          id: '5',
          username: 'jessica_r',
          email: 'jessica.r@example.com',
          title: 'นางสาว',
          firstNameTh: 'เจสสิก้า',
          lastNameTh: 'รักเรียน',
          phone: '0812345671',
          province: 'ภูเก็ต',
          organization: 'กองกิจการนักศึกษา',
          avatar: '',
          role: 'staff',
        },
        {
          id: '6',
          username: 'kevin_s',
          email: 'kevin.s@example.com',
          title: 'นาย',
          firstNameTh: 'เควิน',
          lastNameTh: 'แซ่ตั้ง',
          phone: '0812345672',
          province: 'ขอนแก่น',
          organization: 'ศูนย์นวัตกรรม',
          avatar: '',
          role: 'admin',
        },
        {
          id: '7',
          username: 'alice_s',
          email: 'alice.s@example.com',
          title: 'นางสาว',
          firstNameTh: 'อลิซ',
          lastNameTh: 'สุขประเสริฐ',
          phone: '0812345673',
          province: 'ชลบุรี',
          organization: 'คณะบริหารธุรกิจ',
          avatar: '',
          role: 'student',
        },
        {
          id: '8',
          username: 'chris_w',
          email: 'chris.w@example.com',
          title: 'นาย',
          firstNameTh: 'คริส',
          lastNameTh: 'วงศ์สว่าง',
          phone: '0812345674',
          province: 'นครราชสีมา',
          organization: 'แผนกทรัพยากรบุคคล',
          avatar: '',
          role: 'staff',
        },
        {
          id: '9',
          username: 'bella_t',
          email: 'bella.t@example.com',
          title: 'นางสาว',
          firstNameTh: 'เบลล่า',
          lastNameTh: 'ธนทรัพย์',
          phone: '0812345675',
          province: 'สงขลา',
          organization: 'คณะศิลปศาสตร์',
          avatar: '',
          role: 'student',
        },
        {
          id: '10',
          username: 'martin_p',
          email: 'martin.p@example.com',
          title: 'ดร.',
          firstNameTh: 'มาร์ติน',
          lastNameTh: 'พิทักษ์ไทย',
          phone: '0812345676',
          province: 'กรุงเทพมหานคร',
          organization: 'ภาควิชาคอมพิวเตอร์',
          avatar: '',
          role: 'staff',
        },
        {
          id: '11',
          username: 'lucas_r',
          email: 'lucas.r@example.com',
          title: 'นาย',
          firstNameTh: 'ลูคัส',
          lastNameTh: 'รุ่งเรือง',
          phone: '0812345677',
          province: 'พิษณุโลก',
          organization: 'สำนักทะเบียน',
          avatar: '',
          role: 'student',
        },
        {
          id: '12',
          username: 'emma_c',
          email: 'emma.c@example.com',
          title: 'นางสาว',
          firstNameTh: 'เอ็มม่า',
          lastNameTh: 'ชัยชนะ',
          phone: '0812345678',
          province: 'เชียงใหม่',
          organization: 'ห้องสมุดส่วนกลาง',
          avatar: '',
          role: 'admin',
        },
        {
          id: '13',
          username: 'alex_n',
          email: 'alex.n@example.com',
          title: 'นาย',
          firstNameTh: 'อเล็กซ์',
          lastNameTh: 'นาวา',
          phone: '0812345679',
          province: 'ระยอง',
          organization: 'คณะแพทยศาสตร์',
          avatar: '',
          role: 'student',
        },
        {
          id: '14',
          username: 'grace_a',
          email: 'grace.a@example.com',
          title: 'นางสาว',
          firstNameTh: 'เกรซ',
          lastNameTh: 'อนันต์',
          phone: '0812345680',
          province: 'อยุธยา',
          organization: 'สำนักงานอธิการบดี',
          avatar: '',
          role: 'staff',
        },
        {
          id: '15',
          username: 'daniel_p',
          email: 'daniel.p@example.com',
          title: 'นาย',
          firstNameTh: 'แดเนียล',
          lastNameTh: 'พัฒนา',
          phone: '0812345681',
          province: 'สมุทรปราการ',
          organization: 'คณะวิทยาศาสตร์',
          avatar: '',
          role: 'student',
        },
      ];
    },

    // --- เพิ่มฟังก์ชันจัดการข้อมูลตรงนี้ ---
    addUser(user: Omit<UserProfile, 'id'>) {
      const newId = String(this.usersList.length + 1 + Math.floor(Math.random() * 100));
      this.usersList.push({ ...user, id: newId });
    },

    updateUser(updatedUser: UserProfile) {
      const index = this.usersList.findIndex((u) => u.id === updatedUser.id);
      if (index !== -1) {
        this.usersList[index] = { ...updatedUser };
      }
    },

    deleteUser(userId: string) {
      this.usersList = this.usersList.filter((u) => u.id !== userId);
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot));
}
