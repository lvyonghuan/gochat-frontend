<template>
  <div class="setting-container">
    <h1>设置</h1>
    <div class="setting-item">
      <div class="setting-label">设置提示词前缀</div>
      <div>
        <textarea v-model="promptPrefix"></textarea>
      </div>
      <br>
      <div>
        <button class="save-button" @click="saveSettings">保存</button>
        <button class="back-button" @click="goBack">返回</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      promptPrefix: ''
    };
  },
  mounted() {
    // 从服务器获取设置
    this.getSettings();
    // 页面加载时从 localStorage 中恢复状态
    this.restoreState();
  },
  methods: {
    getSettings(){
        const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
        
        axios.get('http://127.0.0.1:8080/user/get', {
          headers: {
            'Authorization': `${token?.replace(/"/g, '')}`
          }
        })
        .then(response => {
          console.log('获取设置成功:', response.data);
          const config = response.data.data;
          // 将从服务器获取的配置应用到当前组件
          this.promptPrefix = config.prefix_prompt;
        })
        .catch(error => {
          console.error('获取设置失败:', error);
        });
    },

    // 保存设置到服务器
    saveSettings() {
      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      let replyMessage = '';

      // 发送 POST 请求到后端接口
      axios.post('http://127.0.0.1:8080/user/set', 
  {
  }, 
  {
    headers: {
      'Authorization': `${token?.replace(/"/g, '')}`
    },
    params: {
      prefix_prompt: this.promptPrefix
    }
  }
)
      .then(response => {
        alert('设置已成功保存！');
        this.updateSettingsLocally();
        this.$router.push('/chat');
      })
      .catch(error => {
        console.error('保存失败:', error);
        alert('保存失败，请检查网络连接或后端接口是否正常！');
      });
        },
    // 更新本地设置状态到 localStorage
    updateSettingsLocally() {
      localStorage.setItem('appState', JSON.stringify({ promptPrefix: this.promptPrefix }));
    },
    restoreState() {
      const savedState = localStorage.getItem('appState');
      if (savedState) {
        this.promptPrefix = JSON.parse(savedState).promptPrefix || '';
      }
    },
    goBack() {
      this.$router.push('/chat');
    }
  }
  
};
</script>

<style scoped>
.setting-container {
  position: relative;
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background-color: rgb(216.8, 235.6, 255);
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

h1 {
  text-align: center;
  margin-bottom: 20px;
  margin-top: 50px;
}

.setting-item {
  margin-bottom: 20px;
  padding: 20px;
}

.setting-label {
  font-size: 1.1em;
  font-weight: bold;
  margin-bottom: 10px;
  text-align: left;
}

textarea {
  width: 100%;
  height: 80px;
  resize: none;
  padding: 8px;
  border: 1px solid #999;
  border-radius: 6px;
  font-family: Arial, sans-serif;
}

.save-button, .back-button {
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease;
}

.save-button {
  position: absolute;
  bottom: 20px;
  right: 20px;
}

.back-button {
  position: absolute;
  top: 20px;
  left: 20px;
}

.save-button:hover, .back-button:hover {
  background-color: #45a049;
}
</style>