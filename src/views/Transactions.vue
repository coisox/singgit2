<template>
	<div @click="noswipe()">
		<div class="my-header btn-primary">
			<span>Trans <span :class="{'text-danger':total<0}">RM{{toCurrency(total)}}</span></span>
			<span><input type="text" @input="debounce(filter)" @click.stop v-model="filter_string" style="background:transparent; border:0; border-bottom:1px solid white; outline:none; color:white;"></span>
		</div>
		<div class="my-container">
			<swipe-list v-if="transactions.length>0"
				ref="list"
				class="card"
				:items="transactions"
				item-key="id"
			>
				<template v-slot="{item}">
					<table @click.stop="edit(item.id)">
						<tr>
							<td class="text-purple fw-bold">{{item.DDMM}}<br>{{item.YYYY}}</td>
							<td v-if="item.description=='Reconcile'">Reconcile</td>
							<td v-else>
								<div class="ellipsis-container"><div class="text-truncate">{{item.description}}</div></div>
								<div>{{item.category}}: {{item.account_from}} <i v-if="item.account_to" class="bi bi-arrow-right"></i> {{item.account_to}}</div>
							</td>
							<td>
								<i v-if="item.tag" class="text-muted text-small">{{item.tag}}<br></i>
								<span v-if="item.description!='Reconcile'" :class="{'text-danger':item.amount<0, 'text-success':item.amount>=0}">{{toCurrency(item.amount)}}</span>
								<h1 v-else class="bi bi-check-circle-fill m-0 text-purple"></h1>
							</td>
						</tr>
					</table>
				</template>
				<!-- <template v-slot:left="{item}">
					<div class="swipeout-action btn-primary" @click.stop="edit(item.id)"><i class="bi bi-pencil"></i></div>
				</template> -->
				<template v-slot:right="{item}">
					<div class="swipeout-action btn-danger" @click.stop="remove(item.id)"><i class="bi bi-eraser"></i></div>
				</template>
			</swipe-list>
			<div v-else class="card text-nowrap text-center p-2">No record</div>
		</div>

		<div class="my-navigation shadow px-2 border align-items-center" @click.stop>
			<router-link class="p-3 text-purple" to="/form"><i class="bi bi-file-earmark-plus"></i></router-link>
			<router-link class="p-3 text-purple" to="/transactions"><i class="bi bi-journal-text"></i></router-link>
			<router-link class="p-3 text-purple" to="/statistic"><i class="bi bi-graph-up"></i></router-link>
			<a class="p-3 text-muted"><i class="bi bi-grip-vertical"></i></a>

			<a class="p-3 pe-1 text-purple" :class="{'text-muted':page<2}" @click="fetch(-1)"><i class="bi bi-backspace"></i></a>
				<span class="d-none d-lg-inline text-purple ps-2">Page </span>
				<input v-model="page" class="text-purple" @change="fetch()" style="border:0; width:30px; text-align:center; outline:none;">
			<a class="p-3 ps-1 text-purple" @click="fetch(1)"><i class="bi bi-backspace-reverse"></i></a>

			<a class="p-3 pe-1 text-purple d-none d-lg-inline" @click="setMonth(-1)"><i class="bi bi-backspace"></i></a>
				<span class="d-none d-lg-inline text-purple px-2 text-nowrap">{{filter_month}}</span>
			<a class="p-3 ps-1 text-purple d-none d-lg-inline" @click="setMonth(1)"><i class="bi bi-backspace-reverse"></i></a>

			<a class="p-3 text-purple" data-bs-toggle="modal" data-bs-target=".modal" :class="{'text-danger':is_filter}"><i class="bi bi-grid"></i></a>
		</div>

		<div class="modal fade" tabindex="-1">
			<div class="modal-dialog">
				<div class="modal-content">
					<div class="modal-body">
						<div class="row mb-1 g-1">
							<div class="col-4"><label class="col-form-label">Search</label></div>
							<div class="col"><input type="text" class="form-control" v-model="filter_string"></div>
						</div>
						<div class="row mb-1 g-1">
							<div class="col-4"><label class="col-form-label">Account</label></div>
							<div class="col">
								<select class="form-select" v-model="filter_account">
									<option value=""></option>
									<option v-for="item in accounts" :value="item" :key="item">{{item}}</option>
								</select>
							</div>
						</div>
						<div class="row mb-1 g-1">
							<div class="col-4"><label class="col-form-label">Category</label></div>
							<div class="col">
								<select class="form-select" v-model="filter_category" multiple>
									<option value=""></option>
									<option v-for="item in categories" :value="item" :key="item">{{item}}</option>
								</select>
							</div>
						</div>
						<div class="row mb-1 g-1">
							<div class="col-4"><label class="col-form-label">Date From</label></div>
							<div class="col-8"><input type="date" class="form-control" v-model="filter_date_from"></div>
						</div>
						<div class="row mb-1 g-1">
							<div class="col-4"><label class="col-form-label">Date To</label></div>
							<div class="col-8"><input type="date" class="form-control" v-model="filter_date_to"></div>
						</div>
						<div class="row mb-1 g-1">
							<div class="col-4"><label class="col-form-label">Pending Loan</label></div>
							<div class="col-8 d-flex align-items-center">
								<div class="form-check form-switch" style="transform:scale(1.5); transform-origin:left center;">
									<input class="form-check-input" type="checkbox" v-model="filter_pending">
								</div>
							</div>
						</div>
					</div>
					<div class="modal-footer d-flex">
						<button type="button" class="btn btn-success me-auto" @click="clipboard()">Clipboard</button>
						<button type="button" class="btn btn-danger" @click="filter('reset')">Reset</button>
						<button type="button" class="btn btn-primary" @click="filter()" data-bs-dismiss="modal" :ref="'closemodal'">Ok</button>
					</div>
				</div>
			</div>
		</div>

		<textarea id="clipboard"></textarea>

	</div>
</template>

<style scoped>
	#clipboard { position: fixed; top: -200px; }
</style>

<script>
	import moment from 'moment'
	import { SwipeList, SwipeOut } from 'vue-swipe-actions'
	import 'vue-swipe-actions/dist/vue-swipe-actions.css'

	export default {
		components: {
			SwipeOut,
			SwipeList
		},
		data() {
			return {
				filter_string: '',
				filter_account: '',
				filter_category: [''],
				filter_date_from: '',
				filter_date_to: '',
				filter_pending: false,
				transactions: [],
				page: 1,
				limit: 10,
				total: 0,
			}
		},
		props: ['version', 'categories', 'accounts'],
		computed: {
			is_filter: function() {
				return !!(
					this.filter_string +
					this.filter_account +
					this.filter_category.join('') +
					this.filter_date_from +
					this.filter_date_to +
					(this.filter_pending?'x':'')
				)
			},
			filter_month: function() {
				if(!this.filter_date_from) return 'All Months'
				return moment(this.filter_date_from, 'YYYY-MM-DD').format('MMM YYYY')
			}
		},
		methods: {
			filter: function(opt) {
				if(opt=='reset') {
					this.filter_string = ''
					this.filter_account = ''
					this.filter_category = ['']
					this.filter_date_from = ''
					this.filter_date_to = ''
					this.filter_pending = false
				}
				else {
					this.page = 1
					this.fetch()
				}
			},
			noswipe: function() {
				this.$refs.list?.closeActions()
			},
			edit: function(id) {
				this.$router.push({name:'form', params:{id}})
			},
			remove: function(id) {
				var me = this
				db.
					update(tbl_transactions).
					set(tbl_transactions.deleted, 1).
					set(tbl_transactions.updated_date, moment().format('YYYY-MM-DDTHH:mm:ss')).
					where(tbl_transactions.id.eq(id)).
					exec().
				then(function(){
					me.fetch()
				})
			},
			toCurrency: function(n) {
				return new Intl.NumberFormat('en-US', {
					minimumFractionDigits: 2
				}).format(Math.abs(n))
			},
			setMonth: function(n){

				if(!this.filter_date_from) {
					//========================================= if current view has records, pick the first item's date
					if(this.transactions[0]) {
						this.filter_date_from = moment(this.transactions[0].date).startOf('month').format('YYYY-MM-DD')
						this.filter_date_to = moment(this.transactions[0].date).endOf('month').format('YYYY-MM-DD')
					}
					//========================================= if current view has no records, pick today's month
					else {
						this.filter_date_from = moment().startOf('month').format('YYYY-MM-DD')
						this.filter_date_to = moment().endOf('month').format('YYYY-MM-DD')
					}
				}
				else {
					this.filter_date_from = moment(this.filter_date_from, 'YYYY-MM-DD').add(n, 'months').startOf('month').format('YYYY-MM-DD')
					this.filter_date_to = moment(this.filter_date_to, 'YYYY-MM-DD').add(n, 'months').endOf('month').format('YYYY-MM-DD')
				}

				this.fetch()
			},
			fetch: function(p = 0) {

				var me = this
				if(!window['db']) { setTimeout(() => { me.fetch() }, 1); return; } //wait until db ready

				this.page = this.page*1 + p
				if(this.page==0) { this.page = 1; return; }

				db.
					select().
					from(tbl_transactions).
					where(
						lf.op.and(
							tbl_transactions.deleted.neq(1),
							(
								me.filter_string[0]!='!'?(
									tbl_transactions.description.match(/^(?!\!).*$/gi)
								):tbl_transactions.date.isNotNull()
							),
							lf.op.or(
								tbl_transactions.account_from.match(new RegExp(`.*${me.filter_string}.*`, 'gi')),
								tbl_transactions.account_to.match(new RegExp(`.*${me.filter_string}.*`, 'gi')),
								tbl_transactions.amount_string.match(new RegExp(`.*${me.filter_string.replace(/[RM ,]/gi, '')}.*`, 'gi')),
								tbl_transactions.category.match(new RegExp(`.*${me.filter_string}.*`, 'gi')),
								tbl_transactions.tag.match(new RegExp(`.*${me.filter_string}.*`, 'gi')),
								tbl_transactions.tag.match(new RegExp(`.*${me.filter_string.replace(/[RM ,]/gi, '')}.*`, 'gi')),
								tbl_transactions.description.match(new RegExp(`.*${me.filter_string}.*`, 'gi'))
							),
							lf.op.or(
								tbl_transactions.account_from.match(new RegExp(`.*${me.filter_account}.*`, 'gi')),
								tbl_transactions.account_to.match(new RegExp(`.*${me.filter_account}.*`, 'gi'))
							),
							(
								(me.filter_category.length==1 && me.filter_category[0]=='')?
								tbl_transactions.date.isNotNull():
								tbl_transactions.category.in(me.filter_category)
							),
							tbl_transactions.date.gte(me.filter_date_from || '1000'),
							tbl_transactions.date.lte(me.filter_date_to+'T24:00:00' || '5000'),
							(
								me.filter_pending?(
									tbl_transactions.tag.isNotNull(),
									lf.op.or(
										tbl_transactions.account_from.eq('Loan'),
										tbl_transactions.account_to.eq('Loan')
									)
								):tbl_transactions.date.isNotNull()
							)
						)					
					).
					orderBy(tbl_transactions.date, lf.Order.DESC).
					limit(me.filter_pending?Infinity:me.limit).
					skip(me.filter_pending?0:me.limit*(me.page-1)).
					exec().
				then(function(results) {

					me.transactions = []
					me.total = 0

					//======================================================================================= process pending loan
					if(me.filter_pending) {

						//------------------------------------------ sum amount
						var sum = {}
						results.forEach(row=>{
							if(!sum[row.tag]) sum[row.tag] = 0

							if(row.account_from=='Loan') sum[row.tag] -= row.amount
							else sum[row.tag] += row.amount
						})
						
						//------------------------------------------ get items where pending
						results.forEach(row=>{
							if(sum[row.tag]) {
								me.transactions.push({...row, swipe:false, DDMM:moment(row.date).format('DDMM'), YYYY:moment(row.date).format('YYYY')})
								
								if(row.account_from=='Loan') me.total -= row.amount
								else me.total += row.amount
							}
						})
					}
					//======================================================================================= process normal
					else {
						results.forEach(row=>{
							me.transactions.push({...row, swipe:false, DDMM:moment(row.date).format('DDMM'), YYYY:moment(row.date).format('YYYY')})
							me.total += row.amount
						})
					}
				})
			},
			clipboard: function() {
				var me = this

				db.
					select().
					from(tbl_transactions).
					where(
						lf.op.and(
							tbl_transactions.deleted.neq(1),
							tbl_transactions.category.match(new RegExp(`.*[${me.filter_category.join('|')}].*`, 'gi')),
							tbl_transactions.date.gte(me.filter_date_from || '1000'),
							tbl_transactions.date.lte(me.filter_date_to+'T24:00:00' || '5000')
						)
					).
					orderBy(tbl_transactions.date, lf.Order.DESC).
					exec().
				then(function(results) {
					var data = ["DATE	DESCRIPTION	CATEGORY	ACCOUNT	AMOUNT	TAG"]
					results.forEach(i=>{
						if(i.category=='Transfer') {
							data.push(`${i.date.replace('T', ' ')}	${i.description}	${i.category}	${i.account_from}	${-i.amount}	${i.tag}`)
							data.push(`${i.date.replace('T', ' ')}	${i.description}	${i.category}	${i.account_to}	${i.amount}	${i.tag}`)
						}
						else {
							data.push(`${i.date.replace('T', ' ')}	${i.description}	${i.category}	${i.account_from}	${i.amount}	${i.tag}`)
						}
					})

					var copyText = document.getElementById("clipboard")
					copyText.value = data.join('\n')
					setTimeout(()=>{
						copyText.select()
						copyText.setSelectionRange(0, 999999)
						document.execCommand("copy")
					}, 0)

					me.$refs.closemodal.click()
				})
			},
			migration: function() {
				db.update(tbl_transactions).set(tbl_transactions.updated_date, '2021-05-23T00:00:00')
			}
		},
		mounted() {
			this.filter_date_from = this.$route.params.filter_date_from || ''
			this.filter_date_to = this.$route.params.filter_date_to || ''
			this.filter_category = [this.$route.params.filter_category || '']
			this.filter_account = this.$route.params.filter_account || ''
			this.fetch()
		}
	}
</script>