<template>
	<div @click="autosuggest_list=[]">
		<div class="my-header">
			<span>New Transaction</span>
			<span>{{version}}</span>
		</div>
		<div class="my-container">
			<div class="row mb-1 g-1">
				<div class="col-4"><label class="col-form-label">Amount</label></div>
				<div class="col">
					<div class="input-group">
						<input type="text" class="form-control" v-model="form.amount">
						<span class="input-group-text" @click="form.is_negative=!form.is_negative" :class="{'btn-danger':form.is_negative, 'btn-success':!form.is_negative}"><i class="bi" :class="{'bi-dash':form.is_negative, 'bi-plus':!form.is_negative}"></i></span>
					</div>
				</div>
				<div class="col"><input type="text" class="form-control" v-model="form.tag"></div>
			</div>
			<div class="row mb-1 g-1">
				<div class="col-4"><label class="col-form-label">Description</label></div>
				<div class="col position-relative">
					<input type="text" class="form-control form-description" v-model="form.description" @input="debounce(autosuggest_get)">
					<ul class="list-group w-100 pe-1 mt-1 position-absolute" :class="{'d-none':!autosuggest_list.length}">
						<li class="list-group-item" v-for="item in autosuggest_list" :key="item.id" @click="autosuggest_click(item)">{{item.description}}</li>
					</ul>
				</div>
			</div>
			<div class="row mb-1 g-1">
				<div class="col-4"><label class="col-form-label">Category</label></div>
				<div class="col"><select class="form-select" v-model="form.category"><option v-for="item in categories" :value="item" :key="item">{{item}}</option></select></div>
			</div>
			<div class="row mb-1 g-1">
				<div class="col-4"><label class="col-form-label" @click="switchAccount()">Account <i class="d-none bi bi-arrow-left-right"></i></label></div>
				<div class="col"><select class="form-select" v-model="form.account_from"><option v-for="item in accounts" :value="item" :key="item">{{item}}</option></select></div>
				<div class="col"><select class="form-select" v-model="form.account_to"><option value=""></option><option v-for="item in accounts" :value="item" :key="item">{{item}}</option></select></div>
			</div>
			<div class="row mb-1 g-1">
				<div class="col-4" @click="today()"><label class="col-form-label">Date <i class="d-none bi bi-calendar"></i></label></div>
				<div class="col-8"><input type="datetime-local" step="1" class="form-control" v-model="form.date"></div>
			</div>
		</div>

		<div class="my-navigation shadow px-2 border">
			<router-link class="p-3 text-purple" to="/form"><i class="bi bi-file-earmark-plus"></i></router-link>
			<router-link class="p-3 text-purple" to="/transactions"><i class="bi bi-journal-text"></i></router-link>
			<router-link class="p-3 text-purple" to="/statistic"><i class="bi bi-graph-up"></i></router-link>
			<a class="p-3 text-muted"><i class="bi bi-grip-vertical"></i></a>
			<a class="p-3 text-purple" @click="reset()"><i class="bi bi-file-earmark"></i></a>
			<a class="p-3 text-purple" @click="add(1)"><i class="bi bi-plus-circle"></i></a>
			<a class="p-3 text-purple" @click="add()" v-if="form.id"><i class="bi bi-save"></i></a>
		</div>

	</div>
</template>

<style scoped>
	.form-description:focus + ul { display: flex!important; }
</style>

<script>
	import moment from 'moment'

	export default {
		data() {
			return {
				form: {
					id: '',
					is_negative: true,
					account_from: 'Wallet',
					account_to: '',
					amount: '',
					amount_string: '',
					category: 'Food',
					date: moment().format('YYYY-MM-DDTHH:mm:ss'),
					description: '',
					tag: '',
				},
				autosuggest_list: [],
			}
		},
		props: ['version', 'categories', 'accounts'],
		methods: {
			autosuggest_get: function() {
				var me = this
				db.
					select(
						tbl_transactions.description,
						lf.fn.max(tbl_transactions.account_from).as('account_from'),
						lf.fn.max(tbl_transactions.account_to).as('account_to'),
						lf.fn.max(tbl_transactions.category).as('category'),
					).
					from(tbl_transactions).
					where(tbl_transactions.description.match(new RegExp(`.*${me.form.description}.*`, 'gi'))).
					groupBy(tbl_transactions.description).
					limit(5).
					exec().
				then(function(results){
					me.autosuggest_list = results
				})
			},
			autosuggest_click: function(item) {
				for(var key in item) this.form[key] = item[key]
				this.autosuggest_list = []
			},
			fetch: function(id) {
				var me = this

				if(!window['db']) { setTimeout(() => { me.fetch() }, 1); return; } //wait until db ready

				db.
					select().
					from(tbl_transactions).
					where(tbl_transactions.id.eq(id)).
					exec().
				then(function(results) {
					if(results.length) {
						me.form.id = results[0].id
						me.form.is_negative = results[0].amount<0
						me.form.account_from = results[0].account_from
						me.form.account_to = results[0].account_to
						me.form.amount = results[0].amount * (me.form.is_negative?-1:1)
						me.form.amount_string = results[0].amount_string
						me.form.category = results[0].category
						me.form.date = results[0].date
						me.form.description = results[0].description
						me.form.tag = results[0].tag
					}
				})
			},
			reset: function() {
				this.form.id = ''
				this.form.is_negative = true
				this.form.account_from = 'Wallet'
				this.form.account_to = ''
				this.form.amount = ''
				this.form.amount_string = ''
				this.form.category = 'Food'
				this.form.date = moment().format('YYYY-MM-DDTHH:mm:ss')
				this.form.description = ''
				this.form.tag = ''
			},
			add: function(is_new) {

				//=================================================== clean input
				this.form.description = this.form.description.trim()
				this.form.amount = eval(this.form.amount.toString().replace(/[RM ,]/gi, '') || '0')

				//====================================================== auto AI
				if(!this.form.amount && !this.form.description) {
					this.form.amount = 0
					this.form.description = 'Reconcile'
					this.form.category = ''
					this.form.account_from = 'Wallet'
				}
				if((this.form.account_from=='Loan' || this.form.account_to=='Loan') && !this.form.tag) {
					this.form.tag = this.randomString(6)
					this.form.category = 'Transfer'
				}
				if(this.form.amount && !this.form.description) {
					this.form.description = 'Food'
					this.form.category = 'Food'
				}
				if(this.form.category=='Transfer') {
					this.form.is_negative = false
				}

				//====================================================== save amount in string for easier search
				if(this.form.is_negative) this.form.amount *= -1
				this.form.amount_string = this.form.amount.toFixed(2)

				//====================================================== tag
				if(this.form.tag && !isNaN(Number(this.form.tag))) this.form.tag = Number(this.form.tag).toFixed(2)

				//====================================================== save into DB
				var data = JSON.parse(JSON.stringify(this.form))
				data.updated_date = moment().format('YYYY-MM-DDTHH:mm:ss')
				if(!data.id || is_new) delete data.id
				db.insertOrReplace().into(tbl_transactions).values([tbl_transactions.createRow(data)]).exec()

				//====================================================== navigate to transactions
				this.$router.push({name:'transactions'})
			},
			remove: function() {

			},
			randomString: function(length) {
				var result = ''
				var characters = 'ABCDEFGHIJKLNOPQSTUVWXYZ0123456789'
				for(var i=0; i<length; i++ ) result += characters.charAt(Math.floor(Math.random() * characters.length))
				return result
			},
			today: function() {
				this.form.date = moment().format('YYYY-MM-DDTHH:mm:ss')
			},
			switchAccount: function() {
				[this.form.account_from, this.form.account_to] = [this.form.account_to, this.form.account_from]
			},
		},
		mounted() {
			if(this.$route.params.id) this.fetch(this.$route.params.id)
		}
	}
</script>