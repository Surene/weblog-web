<template>
  <div class="container" style="padding-top:100px;text-align:center">
    <h1 style="font-size:72px;font-weight:300;color:#ddd;margin-bottom:16px">404</h1>
    <p style="font-size:16px;color:#999;margin-bottom:32px">页面不存在</p>
    <router-link to="/blog" style="color:#5566cc;font-size:14px">返回博客首页 &raquo;</router-link>
  </div>
</template>

<script setup>
onMounted(() => { document.title = '404 - 页面不存在' })
import { onMounted } from 'vue'
</script>