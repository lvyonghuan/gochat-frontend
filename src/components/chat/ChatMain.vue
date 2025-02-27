<template>
    <el-container class="main-container" direction="vertical">
        <!-- 聊天区域主体 -->
        <el-main class="chat-area">
            <el-scrollbar ref="messageScrollbar" class="full-width-scrollbar">
            <div v-for="(message, index) in messageList" :key="index" class="message-container">
        <div :class="['message', message.user_id == 0 ? 'message-left' : 'message-right']">
            <div class="message-content">
                <!-- 使用v-html渲染格式化后的消息 -->
                <div class="message-text" style="white-space: pre-wrap;" v-html="formatMessage(message.message)"></div>
            </div>
        </div>
    </div>
            </el-scrollbar>
        </el-main>

        <!-- 输入框 -->
        <el-footer class="input-area">
    <el-container class="footer-input-area">
        <el-input v-model="input" style="width:50vw" placeholder="" :disabled="loading" />
        <div style="width: 1vw;"></div>
        <el-button type="primary" @click="handelSendMessage" :loading="loading" :disabled="loading || !input.trim()">发送</el-button>
    </el-container>
</el-footer>
    </el-container>
</template>

<script>
import axios from 'axios';
import qs from 'qs';

export default {
    name: 'ChatMain',
    data() {
        return {
            messageList: [],
            input: '',
            current_dialog_id: 0,
            loading: false  // 添加 loading 状态变量
        };
    },

    props: {
        dialog_id: {
            type: Number,
            required: true
        },
    },

    methods: {
        async getNewMessageList() {
            if (this.current_dialog_id === 0) {
                return;
            }
            
            this.loading = true; // 开始加载状态
            try {
                const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
                const response = await axios.get(`http://127.0.0.1:8080/chat/dialog`, {
                    params: {
                        dialog_id: this.current_dialog_id
                    },
                    headers: {
                        'Authorization': `${token?.replace(/"/g, '')}`
                    }
                });

                if (response.data.code === 200) {
                    // 取得消息列表
                    const messages = response.data.data;
                    
                    // 将消息进行格式化
                    this.messageList = messages.map(message => {
                        return {
                            user_id: message.user_id,
                            message: this.formatMessage(message.message)
                        };
                    });
                    
                    this.$nextTick(() => {
                        this.scrollToBottom();
                    });
                    
                    console.log('消息列表:', this.messageList);
                } else {
                    console.error(response.data);
                }
            } catch (error) {
                console.error('获取消息列表失败:', error);
            } finally {
                this.loading = false; // 结束加载状态
            }
        },

        handelSendMessage() {
            if (this.loading || !this.input.trim()) return; // 如果正在加载或输入为空，则不执行
            
            // 将input压入消息列表
            this.messageList.push({
                user_id: 1, // 假设当前用户ID为1
                message: this.input
            });
            
            // 判断目前消息列表长度
            if (this.current_dialog_id === 0) {
                this.newDialog(this.input);
            } else {
                this.sendMesage(this.input);
            }

            this.input = ''; // 清空输入框
            
            this.scrollToBottom();
        },

        async newDialog() {
            this.loading = true; // 开始加载状态
            try {
                const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
                let replyMessage = '';
                let dialogId = 0;
                
                // 使用 fetch API 代替 EventSource 
                const formData = new FormData();
                formData.append('message', this.input);
                
                const response = await fetch('http://127.0.0.1:8080/chat/new', {
                    method: 'POST',
                    headers: {
                        'Authorization': `${token?.replace(/"/g, '')}`
                    },
                    body: formData
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                
                // 添加带有流式标记的新消息
                this.messageList.push({
                    user_id: 0,
                    message: '',
                    isStreaming: true
                });
                
                const responseIndex = this.messageList.length - 1;
                
                while (true) {
                    const { value, done } = await reader.read();
                    if (done) break;
                    
                    const chunk = decoder.decode(value, { stream: true });
                    
                    // 处理SSE格式，解析事件类型和数据内容
                    const lines = chunk.split('\n');
                    let currentEvent = '';
                    
                    for (const line of lines) {
                        if (line.startsWith('event:')) {
                            currentEvent = line.substring(6).trim();
                        } else if (line.startsWith('data:')) {
                            const dataContent = line.substring(5).trim();
                            
                            if (currentEvent === 'dialog_id') {
                                dialogId = parseInt(dataContent);
                                this.current_dialog_id = dialogId;
                                
                                this.$emit('newDialog', {
                                    id: dialogId,
                                    name: "新对话"
                                });
                                continue;
                            }
                            
                            if (dataContent === "[DONE]") {
                                break;
                            }
                            
                            // 只有消息事件的数据内容才添加到回复中
                            if (currentEvent === 'message' || currentEvent === '') {
                                replyMessage += dataContent;
                                this.messageList[responseIndex].message = replyMessage;
                                this.scrollToBottom();
                            }
                        }
                    }
                }
                
                // 流式传输完成后，移除流标记
                this.messageList[responseIndex].isStreaming = false;
                
            } catch (error) {
                console.error('创建对话失败:', error);
            } finally {
                this.createTitle();
                this.loading = false; // 结束加载状态
            }
        },

        async createTitle() {
            if (this.current_dialog_id === 0) {
                return;
            }

            try {
                const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
                const response = await axios.post('http://127.0.0.1:8080/chat/title', null, {
                    headers: {
                        'Authorization': `${token?.replace(/"/g, '')}`
                    }
                });

                if (response.data.code === 200) {
                    this.$emit('newDialog', {//FIXME
                        id: this.current_dialog_id,
                        name: response.data.data
                    });
                    console.log('生成标题:', response.data.data);
                    return response.data.data;
                } else {
                    console.error('生成标题失败:', response.data);
                    return null;
                }
            } catch (error) {
                console.error('生成标题请求失败:', error);
                return null;
            }
        },

        async sendMesage() {
            this.loading = true; // 开始加载状态
            try {
                const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
                let replyMessage = '';
                
                const formData = new FormData();
                formData.append('dialog_id', this.current_dialog_id);
                formData.append('message', this.input);
                
                const response = await fetch('http://127.0.0.1:8080/chat/chat', {
                    method: 'POST',
                    headers: {
                        'Authorization': `${token?.replace(/"/g, '')}`
                    },
                    body: formData
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                
                // 添加一个带有流式标记的新消息
                this.messageList.push({
                    user_id: 0,
                    message: '',
                    isStreaming: true
                });
                
                const responseIndex = this.messageList.length - 1;
                
                while (true) {
                    const { value, done } = await reader.read();
                    if (done) break;
                    
                    const chunk = decoder.decode(value, { stream: true });
                    
                    // 处理流的结束
                    if (chunk === "[DONE]") {
                        break;
                    }
                    
                    // 解析SSE格式，提取data字段内容
                    const lines = chunk.split('\n');
                    for (const line of lines) {
                        if (line.startsWith('data:')) {
                            // 只提取data:后面的内容
                            const dataContent = line.substring(5);
                            if (dataContent === "[DONE]") {
                                break;
                            }
                            
                            // 添加接收到的消息片段
                            replyMessage += dataContent;
                            
                            // 更新现有消息
                            this.messageList[responseIndex].message = replyMessage;
                            this.scrollToBottom();
                        }
                    }
                }
                
                // 流式传输完成后，移除流标记
                this.messageList[responseIndex].isStreaming = false;                
            } catch (error) {
                console.error('发送消息失败:', error);
            } finally {
                this.loading = false; // 结束加载状态
            }
        },

        scrollToBottom() {
            this.$nextTick(() => {
                const scrollbarRef = this.$refs.messageScrollbar;
                if (scrollbarRef) {
                    try {
                        // 方法一: 尝试使用 Element UI 的 setScrollTop 方法
                        if (typeof scrollbarRef.setScrollTop === 'function') {
                            const scrollHeight = scrollbarRef.$el.querySelector('.el-scrollbar__wrap')?.scrollHeight || 0;
                            scrollbarRef.setScrollTop(scrollHeight);
                        } 
                        // 方法二: 直接操作 DOM
                        else {
                            const scrollWrap = scrollbarRef.$el.querySelector('.el-scrollbar__wrap');
                            if (scrollWrap) {
                                scrollWrap.scrollTop = scrollWrap.scrollHeight;
                            }
                        }
                    } catch (error) {
                        console.error('滚动到底部时出错:', error);
                    }
                }
            });
        },

        changeDialogId() {
            this.current_dialog_id = this.dialog_id;
        },

        // 添加消息格式化方法
        formatMessage(text) {
            if (!text) return '';
            
            // 替换<think>标签为带有淡色样式的span，并移除其中的换行符
            return text.replace(/<think>([\s\S]*?)<\/think>/gs, function(match, content) {
                // 移除content中的换行符
                const cleanContent = content.replace(/\n/g, ' ').replace(/\r/g, '');
                return `<span class="think-text">${cleanContent}</span><br/>`;
            });
        },
    },

    watch: {
        dialog_id(newVal, oldVal) {
            this.current_dialog_id = newVal;
            this.messageList = [];
            if (newVal !== 0) {
                this.getNewMessageList();
            }
        }
    },
    updated() {
        // 页面更新后也滚动到底部
        this.scrollToBottom();
    },

    mounted() {
        // 组件挂载后滚动到底部
        this.scrollToBottom();
        this.changeDialogId();
    },
}
    
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
    height: 80%;
    overflow-y: auto;
    padding: 20px;
}

.input-area {
    height: 20%;
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

.footer-input-area {
    width: 100%;
    display: flex;
    justify-content: center;
}

/* 添加思考文本的样式 */
.message :deep(.think-text) {
    color: #999999;
    opacity: 0.7;
    font-style: italic;
}
</style>