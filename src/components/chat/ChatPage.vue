<template>
  <el-container class="container">
    <!-- 侧边导航栏 -->
    <el-aside width="200px">
      <LeftBar :dialogList="dialogList" @dialog-selected="handleDialogSelected" @create-new-dialog="handleCreateNewDialog" style="width: 100%; height: 100%;"/>
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

export default {
  name: 'ChatPage',

  data(){
    return {
      dialog_id:0,
      dialog_name:"新对话",
      dialogList:[]
    };
  },

  components: {
    LeftBar,
    ChatMain
  },

  methods: {
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

    handleDialogSelected(dialog){
      this.dialog_id=dialog.id;
      this.dialog_name=dialog.name;
    },

    handleCreateNewDialog(){
      this.dialog_id=0;
      this.dialog_name="新对话";
    },

    handleNewDialog(dialog){
      this.dialog_id=dialog.id;
      this.dialog_name=dialog.name;
      this.dialogList.push(dialog);
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