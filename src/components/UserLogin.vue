<template>
  <div class="login-container">
    <form @submit.prevent="handleLogin">
      <div class="input-group">
        <input type="text" v-model="username" placeholder="请输入用户名" required />
      </div>
      <div class="input-group">
        <input type="password" v-model="password" placeholder="请输入密码" required />
      </div>
      <button type="submit" :disabled="!canSubmit">登录</button>
    </form>
    <p class="register-prompt">
      没有账号？<a href="#" @click="goToRegister">立即注册</a>
    </p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      username: '',
      password: '',
    };
  },
  computed: {
    canSubmit() {
      return this.username && this.password;
    }
  },
  methods: {
    handleLogin() {
      if (this.canSubmit) {
        console.log('登录信息:', { username: this.username, password: this.password });
        this.$router.push('/chat');
      }
    },
    goToRegister() {
      this.$router.push('/register'); // 跳转注册页面
    }
  }
};
</script>

<style scoped>
.login-container {
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

button:disabled {
  background-color: #ccc;
}

.register-prompt {
  text-align: center;
  margin-top: 10px;
}

.register-prompt a {
  color: #007bff;
  text-decoration: none;
}

.register-prompt a:hover {
  text-decoration: underline;
}
</style>