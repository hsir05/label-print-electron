<template>
    <div class="container">
        <ul>
            <li>
                <NButton type="primary" @click="uploadFile('1')">РСВА厂</NButton>
            </li>
            <li>
                <NButton type="primary" @click="uploadFile('2')">产品类别</NButton>
            </li>
            <li>
                <NButton type="primary" @click="uploadFile('3')">产品规格</NButton>
            </li>
            <li>
                <NButton type="primary" @click="uploadFile('4')">产品代系</NButton>
            </li>
            <li>
                <NButton type="primary" @click="uploadFile('5')">产品序列号</NButton>
            </li>
            <li>
                <NButton type="primary" @click="uploadFile('6')">年</NButton>
            </li>
            <li>
                <NButton type="primary" @click="uploadFile('7')">周</NButton>
            </li>
            <li>
                <NButton type="primary" @click="uploadFile('8')">国别</NButton>
            </li>
        </ul>
        <NButton @click="back" style="width: 90px;margin-left:10px;">返回</NButton>
    </div>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import * as XLSX from "xlsx";
import {
    NButton,
    NForm,
    NFormItem,
    NInput,
    NCard,
    NSelect,
    NCheckbox,
    NDataTable,
} from "naive-ui";
const router = useRouter();

const uploadFile = (key) => {
    let name = ''
    switch (key) {
        case '1':
            handleOpenFile()
            break;

        default:
            break;
    }
}
const handleOpenFile = async () => {
    try {
        const result = await window.ipcRenderer.openFile();
        if (result) {
            // 读取Excel文件
            const workbook = XLSX.read(result.data, { type: "array" });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];

            // 转换为JSON
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            if (jsonData.length > 0) {
                let yearList = jsonData.slice(1);
                console.log(yearList);
            }
        }
    } catch (error) {
        console.error("Error reading file:", error);
        alert("读取文件失败: " + error.message);
    }
};

const back = () => {
    router.go(-1)
}
</script>
<style>
.container {
    padding: 20px;
    max-width: 1200px;
    background: #fafafc;
    margin: 0 auto;
    height: 100%;


}

ul {
    list-style: none;
}

li {
    padding: 4px 0;
}
</style>