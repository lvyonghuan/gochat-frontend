<template>
  <el-container class="container">
    <!-- 侧边导航栏 -->
    <el-aside width="200px">
      <LeftBar :dialogList="dialogList" :new_select_id="new_select_id" @dialog-selected="handleDialogSelected" @create-new-dialog="handleCreateNewDialog" @delete-dialog-id="handleDeleteDialog" style="width: 100%; height: 100%;"/>
    </el-aside>
    <!-- 聊天框主体 -->
    <el-container class="main-container">
      <el-header>
        <el-card class="header-card">
          <h1>{{ dialog_name }}</h1>
        </el-card>
      </el-header>
      <el-main>
        <ChatMain :dialog_id="dialog_id" @newDialog="handleNewDialog"/>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import LeftBar from './LeftBar.vue';
import ChatMain from './ChatMain.vue';
import axios from 'axios';
import { ElMessage, ElMessageBox } from 'element-plus'; // 引入 Element Plus 的消息提示和确认框

export default {
  name: 'ChatPage',

  data() {
    return {
      dialog_id:0,
      dialog_name:"新对话",
      dialogList:[],
      new_select_id:0
    };
  },

  components: {
    LeftBar,
    ChatMain
  },

  methods: {
    // 获取对话列表
    async getDialogList(){
      try{
        const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
        const response = await axios.get('http://127.0.0.1:8080/chat/list', {
          headers: {
            'Authorization': `${token?.replace(/"/g, '')}`
          }
        });
        if (response.data.code === 200) {
          this.dialogList = response.data.data;
        } else {
          console.error(response.data);
        }
      }catch(error){
        console.error('获取对话列表失败:', error);
      }
    },

    // 处理对话选择
    handleDialogSelected(dialog){
      this.dialog_id = dialog.id;
      this.dialog_name = dialog.name;
    },

    // 处理新建对话
    handleCreateNewDialog(){
      this.dialog_id = 0;
      this.dialog_name = "新对话";
    },

    // 处理新对话
    handleNewDialog(dialog){
      this.dialog_id = dialog.id;
      this.dialog_name = dialog.name;
      
      // 检查列表中是否已存在相同ID的对话
      const existingIndex = this.dialogList.findIndex(item => item.id === dialog.id);
      if (existingIndex !== -1) {
        // 更新已存在的对话
        this.dialogList[existingIndex] = dialog;
      } else {
        // 添加新对话
        this.dialogList.push(dialog);
      }

      this.new_select_id = this.dialogList.findIndex(item => item.id === dialog.id);
    },

    // 处理删除对话
    async handleDeleteDialog(dialogId){
      try{
        const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
        const response = await axios.delete(`http://127.0.0.1:8080/chat/dialog`, {
          headers: {
            'Authorization': `${token?.replace(/"/g, '')}`
          },
          params: {
            "dialog_id": dialogId
          }
        });
      
        if (response.data.code === 200) {
          //从对话列表中删除对话
          this.dialogList = this.dialogList.filter(item => item.id !== dialogId);
        } else {
          console.error(response.data);
        }
      }catch(error){
        console.error('删除对话失败:', error);
      }
    }
    
  },

  mounted(){
    this.getDialogList();
  }
};
</script>

<style>
/* Global reset to remove browser default margins and paddings */
html, body, #app {
  margin: 0;
  padding: 0;
  overflow: hidden;
  box-sizing: border-box;
  height: 100%;
}

* {
  box-sizing: inherit;
}
</style>

<style scoped>
.container {
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  overflow: hidden;
  display: flex;
}

.main-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;
}

.el-aside {
  height: 100vh;
}

.el-container {
  height: 100%;
  display: flex;
}

.el-main {
  flex: 1;
  overflow-y: auto;
}

.el-aside, .el-header, .el-main {
  padding: 0 !important;
  margin: 0 !important;
}

.header-card {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
}

.header-card :deep(.el-card__body) {
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>