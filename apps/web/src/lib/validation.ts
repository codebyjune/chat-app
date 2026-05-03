const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const validateEmail = (email: string) => {
  const value = email.trim()

  if (!value) {
    return '邮箱不能为空'
  }

  if (!emailPattern.test(value)) {
    return '请输入合法的邮箱地址'
  }

  return ''
}

export const validatePassword = (password: string) => {
  if (!password.trim()) {
    return '密码不能为空'
  }

  if (password.length < 6) {
    return '密码最少 6 位'
  }

  return ''
}

export const validateUsername = (username: string) => {
  const value = username.trim()

  if (!value) {
    return '用户名不能为空'
  }

  if (value.length < 3 || value.length > 50) {
    return '用户名长度必须在 3 到 50 个字符之间'
  }

  return ''
}
