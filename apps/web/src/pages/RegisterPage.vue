<script setup lang="ts">
import { register } from '../lib/auth'
import { validateEmail, validatePassword, validateUsername } from '../lib/validation'
import { useAuthForm } from './useAuthForm'
import { useRouter } from 'vue-router'
import AuthPage from '../components/AuthPage.vue'
import RegisterFormCard from '../components/RegisterFormCard.vue'

const router = useRouter()
const {
  values,
  successMessage,
  loading,
  errors,
  touched,
  resetMessages,
  setFieldError,
  touchField,
  resetFieldError,
} = useAuthForm({
  username: '',
  email: '',
  password: '',
})

const validateUsernameField = () => {
  touchField('username')
  setFieldError('username', validateUsername(values.value.username))
}

const validateEmailField = () => {
  touchField('email')
  setFieldError('email', validateEmail(values.value.email))
}

const validatePasswordField = () => {
  touchField('password')
  setFieldError('password', validatePassword(values.value.password))
}

const validateForm = () => {
  validateUsernameField()
  validateEmailField()
  validatePasswordField()

  return !errors.value.username && !errors.value.email && !errors.value.password
}

const enterApp = async () => {
  resetMessages()

  if (!validateForm()) {
    return
  }

  loading.value = true

  try {
    await register({
      username: values.value.username.trim(),
      email: values.value.email.trim(),
      password: values.value.password,
    })

    successMessage.value = '注册成功，正在跳转到登录页...'
    window.setTimeout(() => {
      router.push({ name: 'login' })
    }, 800)
  } catch (error) {
    touchField('email')
    setFieldError('email', error instanceof Error ? error.message : '注册失败，请稍后重试')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthPage>
    <RegisterFormCard
      :username="values.username"
      :email="values.email"
      :password="values.password"
      :loading="loading"
      :username-error="touched.username ? errors.username : ''"
      :email-error="touched.email ? errors.email : ''"
      :password-error="touched.password ? errors.password : ''"
      :success-message="successMessage"
      @submit="enterApp"
      @update-username="values.username = $event; resetFieldError('username')"
      @update-email="values.email = $event; resetFieldError('email')"
      @update-password="values.password = $event; resetFieldError('password')"
      @blur-username="validateUsernameField"
      @blur-email="validateEmailField"
      @blur-password="validatePasswordField"
    />
  </AuthPage>
</template>
