<!--
 * @Date: 2023-10-18 13:32:16
 * @LastEditors: wjs
 * @LastEditTime: 2023-12-21 13:34:15
 * @Description: 注册
-->
<script setup>

const formLabelAlign = reactive({
  name: '',
  region: '',
  type: ''
})
</script>
<template>
  <div id="login">
    <div class="login">
      <el-form label-width="100px" :model="formLabelAlign" style="max-width: 460px">
        <el-form-item label="用户名">
          <el-input v-model="formLabelAlign.name" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="formLabelAlign.psw" />
        </el-form-item>
        <el-form-item label="验证码">
          <el-input v-model="formLabelAlign.yzm" />
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<style scoped lang="less">
#login {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  .login {
    width: 400px;
    height: 400px;
    border-radius: 3px;
    border: 1px solid #999;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}



</style>
