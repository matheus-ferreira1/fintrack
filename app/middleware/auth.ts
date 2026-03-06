export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn } = useUserSession()
  const authPages = ['/login', '/register']

  if (!loggedIn.value && !authPages.includes(to.path)) {
    return navigateTo('/login')
  }

  if (loggedIn.value && authPages.includes(to.path)) {
    return navigateTo('/dashboard')
  }
})
