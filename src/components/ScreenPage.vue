<template>
  <div class="container">
    <h1>Excel 文件查看器</h1>
    <button @click="handleOpenFile" class="open-btn">打开 Excel 文件</button>
    
    <div v-if="fileName" class="file-info">
      当前文件: {{ fileName }}
    </div>
    
    <div v-if="headers.length > 0" class="table-container">
      <table>
        <thead>
          <tr>
            <th v-for="(header, index) in headers" :key="index">
              {{ header }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, rowIndex) in excelData" :key="rowIndex">
            <td v-for="(cell, cellIndex) in row" :key="cellIndex">
              {{ cell }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import * as XLSX from 'xlsx'

const fileName = ref('')
const headers = ref([])
const excelData = ref([])

const handleOpenFile = async () => {
  try {
    const result = await window.ipcRenderer.openFile()
    if (result) {
      fileName.value = result.fileName
      
      // 读取Excel文件
      const workbook = XLSX.read(result.data, { type: 'array' })
      const firstSheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[firstSheetName]
      
      // 转换为JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
      
      if (jsonData.length > 0) {
        headers.value = jsonData[0] // 第一行作为表头
        excelData.value = jsonData.slice(1) // 其余行作为数据
      }
    }
  } catch (error) {
    console.error('Error reading file:', error)
    alert('读取文件失败: ' + error.message)
  }
}
</script>

<style>
.container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.open-btn {
  padding: 10px 15px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  margin-bottom: 20px;
}

.open-btn:hover {
  background-color: #45a049;
}

.file-info {
  margin-bottom: 15px;
  font-size: 14px;
  color: #555;
}

.table-container {
  margin-top: 20px;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

th {
  background-color: #f2f2f2;
  position: sticky;
  top: 0;
}

tr:nth-child(even) {
  background-color: #f9f9f9;
}

tr:hover {
  background-color: #f1f1f1;
}
</style>