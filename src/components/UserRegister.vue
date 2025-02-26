<template>
  <div class="register-wrapper">
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
  </div>
</template>

<script>
import axios from 'axios'; // 引入 axios
import { ElMessage } from 'element-plus'

export default 
{
  data() {
    return {
      username: '',
      password: '',
      confirmPassword: ''
    };
  },
  methods: {
    handleRegister() {
      // 检查两次输入的密码是否一致
      if (this.password !== this.confirmPassword) {
        alert('两次输入的密码不一致！');
        return;
      }
      console.log(this.username,this.password)
      // 发送 POST 请求到后端注册接口
      axios.post('http://127.0.0.1:8080/user/register', null, {
        params: {
          username: this.username,
          password: this.password
        }
      }).then(response => {
            if(response.data.code===200){
              ElMessage.success('注册成功');
              this.$router.push('/login');
            }else{
              console.error(response.data)
              ElMessage.error('注册失败:'+response.data.data);
            }
          }).catch(error => {
            console.error('注册失败:', error.response ? error.response.data : error.message);
          });
    }
  }
};
</script>

<style scoped>
/* 新增的 wrapper 样式 */
.register-wrapper {
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
  height: 100vh; /* 使容器占满整个视口高度 */
  background-color: #f5f5f5; /* 可选：添加背景色 */
}

.register-container {
  max-width: 300px;
  width: 100%;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #fff; /* 可选：添加背景色 */
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); /* 可选：添加阴影 */
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