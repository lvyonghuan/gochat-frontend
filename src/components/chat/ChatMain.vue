<template>
    <el-container class="main-container" direction="vertical">
        <!-- 聊天区域主体 -->
        <el-main class="chat-area">
            <el-scrollbar class="full-width-scrollbar">
            <div v-for="(message, index) in messageList" :key="index" class="message-container">
        <div :class="['message', message.user_id === 0 ? 'message-left' : 'message-right']">
            <div class="message-content">
                <div class="message-text">{{ message.message }}</div>
            </div>
        </div>
    </div>
            </el-scrollbar>
        </el-main>

        <!-- 输入框 -->
        <el-footer class="input-area">
            输入框
        </el-footer>
    </el-container>
</template>

<script>
import axios from 'axios';

export default {
    name: 'ChatMain',
    data(){
    return {
      messageList:[]
    };
  },


    props: {
        dialog_id: {
            type: Number,
            required: true
        }
    },

    methods:{
        async getNewMessageList(){
            // 从后端获取消息列表
            // 1. 从 cookie 中获取 token
            // 2. 使用 token 发送 GET 请求到后端
            // 3. 将消息列表保存到 messageList 中
            const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
            const response = await axios.get(`http://127.0.0.1:8080/chat/dialog`, {
                params: {
                    dialog_id: this.dialog_id
                },
                headers: {
                    'Authorization': `${token?.replace(/"/g, '')}`
                }
            });

            if(response.data.code===200){
                this.messageList=response.data.data;
                console.log('消息列表:',this.messageList);
            }else{
                console.error(response.data);
            }
        }
    },

    watch:{
        dialog_id(newVal, oldVal){
            this.messageList=[];
            if(newVal!==0){
                this.getNewMessageList();
            }
        }
    }
};
</script>

<style scoped>
.main-container {
    margin-left: 5%;
    margin-right: 5%;
    width: 90%;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.chat-area {
    height: 90%;
    overflow-y: auto;
    padding: 20px;
}

.input-area {
    height: 10%;
    min-height: 60px;
    display: flex;
    align-items: center;
    padding: 10px;
}

.message-container {
    width: 100%;
    margin-bottom: 15px;
    display: flex;
}

.message {
    max-width: 70%;
    padding: 10px;
    border-radius: 10px;
}

.message-left {
    align-self: flex-start;
    background-color: #f2f2f2;
    margin-right: auto;
}

.message-right {
    align-self: flex-end;
    background-color: #95ec69;
    margin-left: auto;
}

.message-content {
    display: flex;
    flex-direction: column;
}

.message-text {
    word-break: break-word;
    text-align: left;
}

.full-width-scrollbar {
    width: 100%;
    height: 100%;
}
</style>