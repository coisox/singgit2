import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'

import lf from 'lovefield'
var schemaBuilder = lf.schema.create('singgit', 1)
schemaBuilder.createTable('transactions').
	addColumn('id', lf.Type.INTEGER).
	addColumn('account_from', lf.Type.STRING).
	addColumn('account_to', lf.Type.STRING).
	addColumn('amount', lf.Type.NUMBER).
	addColumn('amount_string', lf.Type.STRING).
	addColumn('category', lf.Type.STRING).
	addColumn('date', lf.Type.STRING).
	addColumn('description', lf.Type.STRING).
	addColumn('tag', lf.Type.STRING).
	addColumn('deleted', lf.Type.INTEGER).
	addColumn('updated_date', lf.Type.STRING).
	addPrimaryKey(['id'], true).
	addNullable(['account_to', 'tag', 'deleted'])

schemaBuilder.connect().then(function (db) {
	window['db'] = db
	window['tbl_transactions'] = db.getSchema().table('transactions')
})

Vue.config.productionTip = false
Vue.config.devtools = true

new Vue({
	router,
	render: h => h(App)
}).$mount('#app')

Vue.mixin({
	methods: {
		debounce: function(f) {
			var me = this
			if(me.timeout) clearTimeout(me.timeout)
			me.timeout = setTimeout(()=>{ f() }, 250)
		},
	},
})