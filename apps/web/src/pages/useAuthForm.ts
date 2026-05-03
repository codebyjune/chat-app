import { ref } from 'vue'

export const useAuthForm = <T extends Record<string, string>>(initialValues: T) => {
  const values = ref({ ...initialValues })
  const successMessage = ref('')
  const loading = ref(false)
  const errors = ref(Object.keys(initialValues).reduce((acc, key) => {
    acc[key as keyof T] = ''
    return acc
  }, {} as Record<keyof T, string>))
  const touched = ref(Object.keys(initialValues).reduce((acc, key) => {
    acc[key as keyof T] = false
    return acc
  }, {} as Record<keyof T, boolean>))

  const resetMessages = () => {
    successMessage.value = ''
  }

  const setFieldError = <K extends keyof T>(field: K, message: string) => {
    errors.value[field] = message
  }

  const touchField = <K extends keyof T>(field: K) => {
    touched.value[field] = true
  }

  const resetFieldError = <K extends keyof T>(field: K) => {
    errors.value[field] = ''
  }

  return {
    values,
    successMessage,
    loading,
    errors,
    touched,
    resetMessages,
    setFieldError,
    touchField,
    resetFieldError,
  }
}
