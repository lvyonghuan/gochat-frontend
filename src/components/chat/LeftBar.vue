<template>
    <el-container direction="vertical" class="left-bar">
      <!-- 顶部新建对话按钮 -->
      <el-container class="top-section">
        <el-button type="primary" :icon="ChatLineSquare" class="new-chat-btn" @click="createNewDialog">新对话</el-button>
      </el-container>
      
      <!-- 中部对话历史记录区域 -->
      <el-container class="middle-section">
        <el-scrollbar class="full-width-scrollbar">
          <el-menu class="dialog-list" :default-active="activeIndex" background-color="#f5f5f5" @select="handleDialogSelect">
            <el-menu-item 
              v-for="dialog in [...dialogList].reverse()" 
              :key="dialog.id" 
              :index="String(dialog.id)" 
              class="dialog-item" 
              @mouseenter="hoveredDialogId = dialog.id" 
              @mouseleave="hoveredDialogId = null"
            >

            <!-- 删除按钮 -->
            <span class="dialog-name">{{ dialog.name }}</span>
            <span v-if="hoveredDialogId === dialog.id" class="delete-icon" @click.stop="$emit('delete-dialog-id', dialog.id)">
            <el-icon color="#ff4d4f" @click="deleteDialog"><Delete /></el-icon>
            </span>
            </el-menu-item>
          </el-menu>
        </el-scrollbar>
      </el-container>
      
      <!-- 底部设置按钮 -->
      <el-container class="bottom-section">
        <el-button type="primary" :icon="Setting" class="setting-btn" @click="goToSettings">设置</el-button>
      </el-container>
    </el-container>
  </template>

<script>
import { ChatLineSquare, Delete, Setting } from '@element-plus/icons-vue';

export default {
    name: 'LeftBar',
    components: {
        Delete
    },
    
    props: {
        dialogList: {
            type: Array,
            required: true
        },
        new_select_id: {
            type: Number,
            required: true
        }
    },

    data() {
        return {
            Setting,
            Delete,
            ChatLineSquare,
            activeIndex: '0',
            hoveredDialogId: null 
        };
    },

    methods: {
        handleDialogSelect(index) {
            const selectedDialog = this.dialogList.find(dialog => String(dialog.id) === index);
            if (selectedDialog) {
                this.$emit('dialog-selected', selectedDialog); 
            }
        },
        createNewDialog() {
            this.$emit('create-new-dialog');
        },
        goToSettings() {
            this.$router.push('/settings');
        },
        deleteDialog() {
            this.$emit('delete-dialog-id', this.hoveredDialogId);
        }
    },

    watch:{
        new_select_id(newVal) {
            this.activeIndex = String(newVal);
        }
    }
};
</script>

<style scoped>
.left-bar {
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: #f5f5f5; 
}

.top-section {
    height: 15%;
    padding: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.new-chat-btn, .setting-btn {
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

.dialog-name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
}

.dialog-item {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    position: relative; 
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    padding-right: 40px; 
}

.delete-icon {
    position: absolute; 
    right: 10px; 
    top: 50%; 
    transform: translateY(-50%); 
    cursor: pointer;
    display: flex; 
    align-items: center;
    justify-content: center; 
    visibility: hidden; 
    transition: visibility 0.3s, color 0.3s; 
}

.dialog-item:hover .delete-icon {
    visibility: visible; 
    color: #ff7875;
}
</style>