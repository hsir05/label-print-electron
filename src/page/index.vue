<template>
    <div class="container">
        <!-- <NCard title="参数配置"> -->
        <h2>参数配置</h2>
        <NForm ref="formRef" :model="form" :rules="rules" label-placement="left" :label-width="110" class="form">
            <NFormItem path="pcba" label="РСВА厂">
                <NSelect v-model:value="form.pcba" :options="PCBAOption" style="width: 200px" />
            </NFormItem>
            <NFormItem path="zzc" label="组装厂">
                <NInput v-model:value="form.zzc" style="width: 200px" :disabled="true" />
            </NFormItem>
            <NFormItem path="category" label="产品类别">
                <NSelect v-model:value="form.category" :options="PCBAOption" style="width: 200px" />
            </NFormItem>
            <NFormItem path="specifications" label="产品规格">
                <NSelect v-model:value="form.specifications" :options="PCBAOption" style="width: 200px" />
            </NFormItem>
            <NFormItem path="series" label="产品代系">
                <NSelect v-model:value="form.series" :options="PCBAOption" style="width: 200px" />
            </NFormItem>
            <NFormItem path="productionId" label="产品序列号">
                <NSelect v-model:value="form.productionId" :options="PCBAOption" style="width: 200px" />
            </NFormItem>
            <NFormItem path="year" label="年">
                <NCheckbox v-model:checked="form.yearEdit" style="width: 30px"></NCheckbox>
                <NInput v-model:value="form.year" :disabled="!form.yearEdit" style="width: 85px" />
                <NSelect v-model:value="form.yearValue" :options="state.yearData" @update:value="
                    (e) => {
                        form.year = e;
                    }
                " style="width: 85px" />
            </NFormItem>
            <NFormItem path="week" label="周">
                <NCheckbox v-model:checked="form.weekEdit" style="width: 30px"></NCheckbox>
                <NInput v-model:value="form.week" :disabled="!form.weekEdit" style="width: 85px" />
                <NSelect v-model:value="form.weekValue" :options="state.weekData" @update:value="
                    (e) => {
                        form.week = e;
                    }
                " style="width: 85px" />
            </NFormItem>
            <NFormItem path="country" label="国别">
                <NSelect v-model:value="form.country" :options="PCBAOption" style="width: 200px" />
            </NFormItem>
            <NFormItem path="serialNumber" label="流水号">
                <NInput v-model:value="form.serialNumber" style="width: 200px" />
            </NFormItem>

            <div class="" style="margin-left:20px">
                <NButton type="primary" @click="submit" style="width: 90px">生成</NButton>
                <NButton @click="reset" style="width: 90px;margin-left:10px;">重置</NButton>
                <NButton @click="config" style="width: 90px;margin-left:10px;">配置</NButton>
                <NButton @click="record" style="width: 90px;margin-left:10px;">配置2</NButton>
            </div>
        </NForm>
        <!-- </NCard> -->

        <!-- <NDataTable
      bordered class="mt-15px"
      :columns="columns"
      :data="tableData"
      :pagination="false"
      :bordered="false"
    /> -->

        <div class="" v-for="(item, index) in printers" :key="index">
            {{ item.name }} {{ item.isDefault }}
        </div>
        <div id="label-designer">
            <canvas id="barcode" width="200" height="100"></canvas>
        </div>

        <div class="toolbox">
            <NButton type="primary" class="ml-10px" id="add-barcode" @click="getBarCode">生成条码</NButton>
            <NButton type="primary" class="ml-10px" id="add-qrcode" @click="selectPrinter">选择打印机</NButton>
            <NButton type="primary" class="ml-10px" id="add-qrcode" @click="printLabel">打印</NButton>
            <NButton type="primary" class="ml-10px" @click="handleOpenFile">打开 Excel 文件</NButton>

            <!-- <NButton type="primary" class="ml-10px" @click="getDb">DB</NButton>
            <NButton type="primary" class="ml-10px" @click="insertDB">insert</NButton>
            <NButton type="primary" class="ml-10px" @click="queryDB">query</NButton> -->

        </div>
    </div>
</template>
<script setup>
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import JsBarcode from "jsbarcode";
import * as XLSX from "xlsx";
// import {sqQuery,sqInsert} from "../utils/db"
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

const formRef = ref()
const form = ref({
    pcba: null,
    category: null,
    specifications: null,
    series: null,
    productionId: null,
    zzc: "0",
    yearEdit: false,
    year: null,
    yearValue: null,

    week: null,
    weekEdit: false,
    country: null,
    serialNumber: null,
});
const tableData = ref([]);
const PCBAOption = ref([]);
const router = useRouter();
const fileName = ref("");

const state = reactive({
    weekData: [],
    yearData: [],
});

const columns = [
    {
        title: "序号",
        key: "no",
    },
    {
        title: "SN码",
        key: "title",
    },
];

const rules = {
    pcba: { required: true, message: '请选择РСВА厂', trigger: ['input'] },
    category: { required: true, message: '请选择产品类别', trigger: ['input'] },
    specifications: { required: true, message: '请选择产品规格', trigger: ['input'] },
    series: { required: true, message: '请选择产品代系', trigger: ['input'] },
    productionId: { required: true, message: '请选择产品序列号', trigger: ['input'] },
    zzc: { required: true, message: '请输入组装厂', trigger: ['input'] },
    year: { required: true, message: '请选择年', trigger: ['input'] },
    week: { required: true, message: '请选择周', trigger: ['input'] },
    country: { required: true, message: '请选择国别', trigger: ['input'] },
    serialNumber: { required: true, message: '请选择流水号', trigger: ['input'] }
};
onMounted(() => { });

const getDb=async()=>{
//    try {
//     let res = await sqQuery()
//     console.log(res);
//    } catch (err) {
//     console.log(err);
//    }
}
const insertDB=async()=>{
//    try {
//     let res = await getDatabase()
//     console.log(res);
//    } catch (err) {
//     console.log(err);
//    }
}
const queryDB=async()=>{
//    try {
//     let res = await sqQuery()
//     console.log(res);
//    } catch (err) {
//     console.log(err);
//    }
}
const submit = (e) => {
    e.preventDefault()
    formRef.value?.validate((errors) => {
        if (!errors) {

        } else {
            console.log(errors)
        }
    })
};
const config = () => {
    router.push({ path: '/config' })
}
const record = () => {
    router.push({ path: '/record' })
}
const reset = () => {
    console.log(formRef.value);

    formRef.value?.restoreValidation()
}
ipcRenderer.on("navigate-to", (event, path) => {
    router.push(path); // 使用 Vue Router 进行跳转
});
const printers = ref([]);
const getBarCode = () => {
    JsBarcode("#barcode", "601211KBD0000018", {
        format: "CODE128",
        lineColor: "#000",
        width: 1.3,
        height: 40,
        displayValue: true,
    });
};

const selectPrinter = async () => {
    try {
        printers.value = await ipcRenderer.invoke("get-printers");
        console.log("可用的打印机:", printers.value);
    } catch (error) {
        console.error("获取打印机时出错:", error);
    }
};
async function printLabel () {
    try {
        // if (!printerName) {
        //     const defaultPrinter = printers.find(p => p.isDefault);
        //     if (!defaultPrinter) throw new Error('没有设置默认打印机');
        //     printerName = defaultPrinter.name;
        // }
        const element = document.getElementById("label-designer");
        const html = `
    <!DOCTYPE html>
    <html>
      <body>${element.outerHTML}</body>
    </html>
  `;

        // 准备打印选项

        // // 调用主进程的打印方法
        const success = await ipcRenderer.invoke("print-dom-element", html);
        if (!success) throw new Error("打印失败");
        console.log("打印结果:", success);
    } catch (error) {
        console.error("打印出错:", error);
    }
}

const handleOpenFile = async () => {
    try {
        const result = await window.ipcRenderer.openFile();
        if (result) {
            fileName.value = result.fileName;

            // 读取Excel文件
            const workbook = XLSX.read(result.data, { type: "array" });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];

            // 转换为JSON
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            if (jsonData.length > 0) {
                let yearList = jsonData.slice(1);
                state.yearData = [];
                for (let key of yearList) {
                    state.yearData.push({ label: `${key[0]}`, value: `${key[1]}` });
                }
            }
        }
    } catch (error) {
        console.error("Error reading file:", error);
        alert("读取文件失败: " + error.message);
    }
};
</script>

<style scoped></style>
<style scoped lang="less">
.container {
    padding: 20px;
    background: #fafafc;
    margin: 0 auto;
    height: 100%;
}

.ml-10px {
    margin-left: 10px;
}

.mt-15px {
    margin-top: 15px;
}

.form {
    display: flex;
    flex-wrap: wrap;
    background: white;
    padding-top: 15px;

    h3 {
        font-size: 14px;
    }
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

th,
td {
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
