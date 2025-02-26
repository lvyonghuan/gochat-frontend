<template>
  <el-container class="container">
    <!-- 侧边导航栏 -->
    <el-aside width="200px"><LeftBar style="width: 100%; height: 100%;"/></el-aside>
    <!-- 聊天框主体 -->
    <el-container class="main-container">
      <el-header>Header</el-header>
      <el-main>Main</el-main>
      <el-footer>Footer</el-footer>
    </el-container>
  </el-container>
</template>


<script>
import LeftBar from './LeftBar.vue';

export default {
  name: 'ChatPage',
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

.el-aside, .el-header, .el-main, .el-footer {
  padding: 0 !important;
  margin: 0 !important;
}
</style>