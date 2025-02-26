<template>
    <el-container direction="vertical" class="left-bar">
        <!-- 顶部新建对话按钮 占据侧边栏高度的15%-->
        <el-container class="top-section">
            <el-button type="primary" :icon="ChatLineSquare" class="new-chat-btn" @click="createNewDialog">新对话</el-button>
        </el-container>
        
        <!-- 中部对话历史记录区域 占据侧边栏高度70%-->
        <el-container class="middle-section">
            <el-scrollbar class="full-width-scrollbar">
                <el-menu class="dialog-list" :default-active="activeIndex" background-color="#f5f5f5" @select="handleDialogSelect">
                    <!-- 将 dialog.id 转换为字符串 -->
                    <el-menu-item v-for="dialog in dialogList" :key="dialog.id" :index="String(dialog.id)" class="dialog-item">
                        {{ dialog.name }}
                    </el-menu-item>
                </el-menu>
            </el-scrollbar>
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
    
    props: {
        dialogList: {
            type: Array,
            required: true
        }
    },

    data() {
        return {
            ChatLineSquare,
            activeIndex: '1' 
        };
    },

    methods:{
        handleDialogSelect(index) {
            const selectedDialog = this.dialogList.find(dialog => String(dialog.id) === index);
            if(selectedDialog) {
                this.$emit('dialog-selected', selectedDialog); 
            }
        },
        createNewDialog() {
            this.$emit('create-new-dialog');
        }
    }
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

.full-width-scrollbar {
    width: 100%;
    height: 100%;
}

.dialog-item {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    position: relative;
}

.dialog-item::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    height: 100%;
    width: 25%; 
    background: linear-gradient(to left, rgb(255, 255, 255), rgba(0, 0, 0, 0));
    pointer-events: none;
}
</style>