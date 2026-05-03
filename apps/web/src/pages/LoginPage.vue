<script setup lang="ts">
import { login } from '../lib/auth'
import { validateEmail, validatePassword } from '../lib/validation'
import { useAuthForm } from './useAuthForm'
import { useRouter } from 'vue-router'
import AuthPage from '../components/AuthPage.vue'
import LoginFormCard from '../components/LoginFormCard.vue'

const router = useRouter()
const {
  values,
  loading,
  errors,
  touched,
  resetMessages,
  setFieldError,
  touchField,
  resetFieldError,
} = useAuthForm({
  email: '',
  password: '',
})

const validateEmailField = () => {
  touchField('email')
  setFieldError('email', validateEmail(values.value.email))
}

const validatePasswordField = () => {
  touchField('password')
  setFieldError('password', validatePassword(values.value.password))
}

const validateForm = () => {
  validateEmailField()
  validatePasswordField()

  return !errors.value.email && !errors.value.password
}

const enterApp = async () => {
  resetMessages()

  if (!validateForm()) {
    return
  }

  loading.value = true

  try {
    await login({
      email: values.value.email.trim(),
      password: values.value.password,
    })

    router.push({ name: 'app' })
  } catch (error) {
    touchField('password')
    setFieldError('password', error instanceof Error ? error.message : '登录失败，请稍后重试')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthPage>
    <LoginFormCard
      :email="values.email"
      :password="values.password"
      :loading="loading"
      :email-error="touched.email ? errors.email : ''"
      :password-error="touched.password ? errors.password : ''"
      @submit="enterApp"
      @update-email="values.email = $event; resetFieldError('email')"
      @update-password="values.password = $event; resetFieldError('password')"
      @blur-email="validateEmailField"
      @blur-password="validatePasswordField"
    />
  </AuthPage>
</template>
