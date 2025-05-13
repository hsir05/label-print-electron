<template>
    <button @click="begainScreen">截屏</button>

    <img class="box-img" :src="imgSrc" alt="">
</template>

<script setup lang="ts">
import { ref } from 'vue';
// import ScreenShot from "js-web-screen-shot";
// import { getDesktopCapturerSource, getInitStream } from '@/utils/tool'

const imgSrc = ref("")
const begainScreen = async () => {
    
}


</script>

<style scoped lang="less">
.box-img {
    width: 200px;
    position: fixed;
    right: 10px;
    top: 10px;
    border: 2px solid red;
}
</style>