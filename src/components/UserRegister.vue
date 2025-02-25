<template>
  <div class="register-container">
    <form @submit.prevent="handleRegister">
      <div class="input-group">
        <input type="text" v-model="username" placeholder="请输入用户名" required />
      </div>
      <div class="input-group">
        <input type="password" v-model="password" placeholder="请输入密码" required />
      </div>
      <div class="input-group">
        <input type="password" v-model="confirmPassword" placeholder="请确认密码" required />
      </div>
      <button type="submit">注册</button>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      username: '',
      password: '',
      confirmPassword: ''
    };
  },
  methods: {
    handleRegister() {
      if (this.password === this.confirmPassword) {
        console.log('注册成功:', { username: this.username });
        this.$router.push('/login'); // 注册后跳到登录页面
      } else {
        alert('两次输入的密码不一致！');
      }
    }
  }
};
</script>

<style scoped>
.register-container {
  max-width: 300px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.input-group {
  margin-bottom: 15px;
}

input[type="text"],
input[type="password"] {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  width: 100%;
  padding: 10px;
  background-color: #000;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>