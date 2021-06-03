import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

export default new VueRouter({
	routes: [
		{
			path: '/',
			redirect: { name: 'form', params: {id: null} }
		},
		{
			path: '/form/:id?',
			name: 'form',
			component: () => import('../views/Form.vue')
		},
		{
			path: '/transactions/:filter_date_from?/:filter_date_to?/:filter_category?/:filter_account?',
			name: 'transactions',
			component: () => import('../views/Transactions.vue')
		},
		{
			path: '/statistic',
			name: 'statistic',
			component: () => import('../views/Statistic.vue')
		},
	]
})