<template>
    <div class="setting-container">
      <h1>设置</h1>
      <div class="setting-item">
        <div class="setting-label">设置选项1</div>
        <div class="setting-content">
          <div class="setting-option">
            <label>
              <input type="radio" v-model="selectedOption1" value="option1" />
              选项1
            </label>
          </div>
          <div class="setting-option">
            <label>
              <input type="radio" v-model="selectedOption1" value="option2" />
              选项2
            </label>
          </div>
        </div>
        <br><br>
  
        <div class="setting-label">设置选项2</div>
        <div class="setting-content">
          <div class="setting-option">
            <label>
              <input type="radio" v-model="selectedOption2" value="option1" />
              选项1
            </label>
          </div>
          <div class="setting-option">
            <label>
              <input type="radio" v-model="selectedOption2" value="option2" />
              选项2
            </label>
          </div>
        </div>
        <br><br>
        
        <div class="setting-label">设置提示词前缀</div>
        <div>
          <textarea></textarea>
        </div>
        <br>

      <div>
        <button class="save-button" @click="saveSettings">保存</button>
      </div>

      <div>
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
      selectedOption1: 'option1',
      selectedOption2: 'option1',
      promptPrefix: ''
    };
  },
  mounted() {
    // 页面加载时从 localStorage 中恢复状态
    this.restoreState();
  },
  methods: {
    // 保存设置到服务器
    saveSettings() {
      console.log('保存设置:', this.selectedOption1, this.selectedOption2, this.promptPrefix);

      // 发送 POST 请求到后端接口
      axios.post('http://127.0.0.1:8080/user/set', {
        promptPrefix: this.promptPrefix
      })
      .then(response => {
        console.log('保存成功:', response.data);
        alert('设置已成功保存到服务器！');
        this.updateSettingsLocally(); // 更新本地设置
        this.$router.push('/chat'); // 跳转到聊天界面
      })
      .catch(error => {
        console.error('保存失败:', error);
        alert('保存失败，请检查网络连接或后端接口是否正常！');
      });
    },
    // 更新本地设置状态到 localStorage
    updateSettingsLocally() {
      console.log('更新本地设置:', this.selectedOption1, this.selectedOption2);

      // 保存状态到 localStorage
      const state = {
        selectedOption1: this.selectedOption1,
        selectedOption2: this.selectedOption2
      };
      localStorage.setItem('appState', JSON.stringify(state));
    },
    // 从 localStorage 中恢复状态
    restoreState() {
      const savedState = localStorage.getItem('appState');
      if (savedState) {
        const state = JSON.parse(savedState);
        this.selectedOption1 = state.selectedOption1 || '';
        this.selectedOption2 = state.selectedOption2 || '';
      }
    },
    // 返回聊天界面
    goBack() {
      this.$router.push('/chat'); // 跳转到聊天界面
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
  
  .setting-content {
    margin-top: 10px;
  }
  
  .setting-option {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
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

  .save-button {
  position: absolute;
  bottom: 20px;
  right: 20px; 
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
}

.back-button {
  position: absolute;
  top: 20px;
  left: 20px; 
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease;
}

.save-button:hover, .back-button:hover {
  background-color: #45a049;
}

</style>