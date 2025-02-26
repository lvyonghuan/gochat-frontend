<template>
  <div class="login-wrapper">
    <div class="login-container">
      <form @submit.prevent="handleLogin">
        <div class="input-group">
          <input type="text" v-model="username" placeholder="请输入用户名" required />
        </div>
        <div class="input-group">
          <input type="password" v-model="password" placeholder="请输入密码" required />
        </div>
        <button type="submit" @click="handleLogin">登录</button>
      </form>
      <p class="register-prompt">
        没有账号？<a href="#" @click="goToRegister">立即注册</a>
      </p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { ElMessage } from 'element-plus'

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
          // 使用 GET 请求，将参数附加到 URL 中
          axios.get('http://127.0.0.1:8080/user/login', {
            params: {
              username: this.username,
              password: this.password
            }
          }).then(response => {
            // 处理登录成功的逻辑
            if(response.data.code===200){
              ElMessage.success('登录成功');
              // Store user data in cookie
              const expireTime = new Date(new Date().getTime() + 12 * 60 * 60 * 1000); // 12 hours from now
              document.cookie = `token=${JSON.stringify(response.data.data)};expires=${expireTime.toUTCString()};path=/`;
              this.$router.push('/chat'); // 跳转到空白页面或其他页面
            }else{
              ElMessage.error('登录失败:'+response.data.data);
            }
          }).catch(error => {
            // 处理登录失败的逻辑
            console.error('登录失败:', error.response ? error.response.data : error.message);
          });
    },
    goToRegister() {
      this.$router.push('/register');
    }
  }
};
</script>

<style scoped>
.login-wrapper {
  display: flex;
  justify-content: center; 
  align-items: center; 
  height: 100vh; 
  background-color: #f5f5f5; 
}

.login-container {
  max-width: 300px;
  width: 100%;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); 
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