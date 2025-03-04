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
        <el-input v-model="input" style="width:50vw" placeholder="" :disabled="loading" @keyup.enter="handelSendMessage"/>
        <div style="width: 1vw;"></div>
        <el-button type="primary" @click="handelSendMessage" :loading="loading" :disabled="loading || !input.trim()">发送</el-button>
    </el-container>
</el-footer>
    </el-container>
</template>

<script>
import axios from 'axios';
import MarkdownIt from 'markdown-it';

export default {
    name: 'ChatMain',
    data() {
        return {
            messageList: [],
            input: '',
            current_dialog_id: 0,
            loading: false,  // 添加 loading 状态变量

            md: new MarkdownIt({
        html: true,        // 允许HTML标签
        breaks: true,      // 将\n转换为<br>
        linkify: true      // 自动转换URL为链接
      })
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
                    console.log(chunk);
                    
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
                            replyMessage += dataContent+'\n';
                            
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

        formatMessage(text) {
    if (!text) return '';
    
    // 初始化 markdown-it (如果尚未初始化)
    if (!this.md) {
        this.md = new MarkdownIt({
            breaks: true,
            linkify: true,
            typographer: true
        });
    }
    
    // 第一步：将<think>标签内容提取出来，替换为特殊标记
    let thinkBlocks = [];
    let processedText = text.replace(/<think>([\s\S]*?)<\/think>/g, function(match, content) {
        let id = thinkBlocks.length;
        thinkBlocks.push(content);
        return `<div id="think-marker-${id}"></div>`;
    });
    
    // 第二步：对非<think>部分应用Markdown渲染
    let renderedHtml = this.md.render(processedText);
    
    // 第三步：将<think>内容重新插入，应用特定样式
    thinkBlocks.forEach((content, id) => {
        // 处理<think>内容 - 去除多余换行但保留段落结构
        let formattedContent = content
            .replace(/\r/g, '')  // 移除回车符
            .trim()              // 移除首尾空白
            .replace(/\n\n+/g, '<br><br>')  // 两个以上连续换行作为段落分隔
            .replace(/\n/g, ' '); // 单个换行替换为空格
        
        // 在渲染后的HTML中查找并替换标记
        renderedHtml = renderedHtml.replace(
            `<div id="think-marker-${id}"></div>`,
            `<div class="think-text">${formattedContent}</div>`
        );
    });
    
    // 清理可能的多余换行
    renderedHtml = renderedHtml.replace(/<br\s*\/?>\s*<\/p>/g, '</p>');
    
    return renderedHtml;
}
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
    margin-bottom: 10px; /* 从15px减少到10px */
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
    margin-bottom: 0; /* 移除10px的底部边距 */
    line-height: 1.3;
    background-color: #f7f7f7; /* 轻微背景色以区分 */
    padding: 8px 8px 4px 8px; /* 减少底部内边距 */
    border-radius: 4px;
    display: block;
}

/* Markdown样式 */
.message-text h1 { font-size: 1.5em; margin: 0.5em 0; }
.message-text h2 { font-size: 1.3em; margin: 0.5em 0; }
.message-text h3 { font-size: 1.2em; margin: 0.5em 0; }
.message-text p { 
  margin: 0.5em 0 0.3em 0; /* 减小段落间距 */
}
.message-text code { 
  background-color: #f5f5f5; 
  padding: 2px 4px;
  border-radius: 3px;
  font-family: monospace;
}
.message-text pre { 
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 5px;
  overflow-x: auto;
}

/* 修复列表对齐问题 */
.message-text ul, .message-text ol { 
  margin: 0.3em 0; 
  padding-left: 2em; /* 增加左侧填充以对齐数字和文本 */
}
.message-text ol li {
  padding-left: 0.3em; /* 为有序列表项添加左侧填充 */
  margin-bottom: 0.2em; /* 减小列表项之间的间距 */
}
.message-text ul li {
  margin-bottom: 0.2em; /* 减小列表项之间的间距 */
}

/* 减少段落和块元素之间的空白 */
.message-text br {
  line-height: 1; /* 减少br标签的行高 */
  margin-bottom: 0.3em;
  display: block; /* 确保它作为块元素可以接受margin */
  content: ""; /* 必要的，让空元素显示边距 */
}

.message-text blockquote {
  border-left: 3px solid #ddd;
  margin-left: 0;
  padding-left: 10px;
  color: #666;
  margin-top: 0.3em;
  margin-bottom: 0.3em;
}
.message-text a {
  color: #0366d6;
  text-decoration: none;
}
.message-text a:hover {
  text-decoration: underline;
}
.message-text table {
  border-collapse: collapse;
  margin: 0.3em 0;
}
.message-text table th, .message-text table td {
  border: 1px solid #ddd;
  padding: 6px 13px;
}
.message-text table tr:nth-child(2n) {
  background-color: #f8f8f8;
}

/* 确保最后一个元素没有底部边距 */
.message-text > *:last-child {
  margin-bottom: 0;
}

/* 修复<p>标签内换行问题 */
.message-text p {
  line-height: 1.5; /* 适中的行高 */
  margin:0,
}

/* 更新 think-text 样式 */
.message :deep(.think-text) {
    color: #999999;
    opacity: 0.7;
    font-style: italic;
    margin-bottom: 0; /* 移除10px的底部边距 */
    line-height: 1.3;
    background-color: #f7f7f7; /* 轻微背景色以区分 */
    padding: 8px 8px 4px 8px; /* 减少底部内边距 */
    border-radius: 4px;
    display: block;
}

.message :deep(.think-line-break) {
    line-height: 1.2; /* 减小行间距 */
    margin-top: 4px; /* 小的顶部间距 */
}

/* 完全移除段落间的边距 */
.message-text p {
  margin: 0; /* 移除所有边距 */
  padding: 0; /* 确保没有内边距 */
  line-height: 1.4; /* 适中的行高 */
}

/* 使用选择器为需要间距的元素添加少量上边距 */
.message-text p + p {
  margin-top: 0.3em; /* 只在段落与段落之间添加小间距 */
}

/* 减小列表中段落的边距 */
.message-text li p {
  margin: 0; /* 列表中的段落不需要额外边距 */
}

/* 为不同块元素之间添加最小必要的间距 */
.message-text h1 + p,
.message-text h2 + p, 
.message-text h3 + p,
.message-text blockquote + p,
.message-text pre + p,
.message-text ul + p,
.message-text ol + p {
  margin-top: 0.2em;
}

/* 调整整体行距 */
.message-text {
  line-height: 1.3; /* 略微减小整体行距 */
}

/* 确保最后一个元素没有底部边距 */
.message-text > *:last-child {
  margin-bottom: 0;
}

/* 修复列表项中所有元素的边距问题 */
.message-text li * {
  margin-top: 0;
  margin-bottom: 0;
}

/* 修复列表对齐和内部间距问题 */
.message-text ul, .message-text ol { 
  margin: 0.2em 0; /* 减小列表整体的上下边距 */
  padding-left: 1.5em; /* 减小左侧填充 */
}

/* 优化列表项间距 */
.message-text li {
  margin: 0.1em 0; /* 极小的列表项间距 */
  line-height: 1.3; /* 减少行高 */
}

/* 解决列表中的段落问题 */
.message-text li p:first-child {
  display: inline; /* 使第一个段落内联显示 */
}

/* 处理列表中的后续段落 */
.message-text li p:not(:first-child) {
  margin-top: 0.1em;
  margin-left: 0;
  padding-left: 0;
}

/* 修复嵌套列表的边距 */
.message-text li ul, 
.message-text li ol {
  margin-top: 0.1em;
  margin-bottom: 0.1em;
}

/* 修复列表中的其他元素 */
.message-text li h1, 
.message-text li h2, 
.message-text li h3, 
.message-text li h4, 
.message-text li h5, 
.message-text li h6 {
  margin: 0;
  padding: 0;
  line-height: 1.3;
}

/* 强制重置 markdown-it 默认生成的列表样式 */
.message-text ol,
.message-text ul {
  margin: 0.2em 0;
  padding-left: 1.5em;
  list-style-position: outside;
}

/* 复位所有列表项上的所有边距 */
.message-text li {
  margin: 0.1em 0;
  padding: 0;
  line-height: 1.3;
}

/* 直接针对列表中的所有元素，包括嵌套标签 */
.message-text li,
.message-text li p,
.message-text li div,
.message-text li span,
.message-text li h1,
.message-text li h2,
.message-text li h3,
.message-text li h4,
.message-text li h5,
.message-text li h6 {
  margin-top: 0 !important;
  margin-bottom: 0 !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
}

/* 让列表中的第一个段落与列表标记在同一行 */
.message-text li > p:first-child {
  display: inline-block !important;
}

/* 专门处理有序列表的数字对齐问题 */
.message-text ol {
  counter-reset: item;
  padding-left: 1em;
}

.message-text ol > li {
  position: relative;
  padding-left: 1.5em;
  counter-increment: item;
  list-style: none;
}

.message-text ol > li:before {
  content: counter(item) ". ";
  position: absolute;
  left: 0;
  top: 0;
  width: 1.5em;
  text-align: right;
}

/* 使用更强的选择器专门处理 markdown-it 渲染内容 */
.message-text li.task-list-item {
  margin-left: 0;
  list-style: none;
}

/* 消除列表中的段落引起的额外空间 */
.message-text li > p {
  margin: 0 !important;
  padding: 0 !important;
}

/* 处理嵌套列表 */
.message-text li > ol,
.message-text li > ul {
  margin-top: 0.1em !important;
  margin-bottom: 0.1em !important;
  padding-left: 1em !important;
}

/* 全局强制覆盖所有p标签的边距 */
.message-text p,
.message-text li p {
  margin: 0 !important;
  padding: 0 !important;
  line-height: 1.4 !important;
}

/* 完全移除markdown-it生成的默认边距 */
.message-text :deep(p) {
  margin: 0 !important;
  padding: 0 !important;
}

/* 处理入口级 p 标签之间需要的少量间隔 */
.message-text > p + p {
  margin-top: 0.3em !important;
}
</style>