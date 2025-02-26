<template>
    <el-container direction="vertical" class="left-bar">
        <!-- 顶部新建对话按钮 占据侧边栏高度的15%-->
        <el-container class="top-section">
            <el-button type="primary" :icon="ChatLineSquare" class="new-chat-btn">新对话</el-button>
        </el-container>
        
        <!-- 中部对话历史记录区域 占据侧边栏高度70%-->
        <el-container class="middle-section">
        </el-container>
        
        <!-- 底部设置按钮 占据侧边栏高度的15%-->
        <el-container class="bottom-section">
        </el-container>
    </el-container>
</template>

<script>
import { ChatLineSquare } from '@element-plus/icons-vue'

export default {
    name: 'LeftBar',
    
    data() {
        return {
            ChatLineSquare
        };
    },
};
</script>

<style scoped>
.left-bar {
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: #f5f5f5;  /* 添加浅灰色背景 */
}

.top-section {
    height: 15%;
    padding: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.new-chat-btn {
    width: 100%;
}

.middle-section {
    height: 70%;
    overflow-y: auto;
}

.bottom-section {
    height: 15%;
    padding: 10px;
}
</style>