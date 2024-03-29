
function GenerateDistinctClause(options) {
	return [
		Choice(0, [
			new Skip(),
			Sequence([
				Keyword("DISTINCT"),
				Optional(Sequence([
					Keyword("ON"),
					Keyword("("),
					OneOrMore(Expression(), ","),
					Keyword(")"),
				]) , "skip")
			]),
			Keyword("ALL")
		])
	]
}

function GenerateCommonTableExpression(options) {
	return [
		Expression("table-name"),
		Optional(Sequence([
			Keyword("("),
			OneOrMore(Expression("column-name"), Keyword(",")),
			Keyword(")")
		]), "skip"),
		Keyword("AS"),
		Keyword("("),
		Expression("select-node"),
		Keyword(")")
	]
}

function GenerateOrderBy(options) {
	return [
		Keyword("ORDER"),
		Keyword("BY"),
		GenerateOrderTerms()
	]
}

function GenerateSelectClause(options) {
	return [
		Keyword("SELECT"),
		Expandable("distinct-clause", options, "distinct-clause", GenerateDistinctClause),
		OneOrMore(Choice(0, [
			Sequence([Expression(), Optional(Sequence([Keyword("AS"), Expression("alias")]), "skip")]),
			Sequence([
				Optional(Sequence([Expression("table-name"), Keyword(".")]), "skip"),
				Keyword("*")
			])
		]), ",")
	]
}

function GenerateFromClause(options) {
	return [
		Keyword("FROM"),
		OneOrMore(Sequence(GenerateTableOrSubquery(options)), Keyword(","))
	]
}

function GenerateGroupByClause(options) {
	return [
		Optional(Sequence([
			Keyword("GROUP"),
			Keyword("BY"),
			OneOrMore(Expression(), ","),
		])),
		Optional(Sequence([
			Keyword("HAVING"),
			Expression()
		]))
	]
}

function GenerateWindowClause(options) {
	return [
		Keyword("WINDOW"),
		OneOrMore(Sequence([
				Expression("window-name"),
				Keyword("AS"),
				Expandable("window-definition", options, "window-definition", GenerateWindowSpec)
		]), Keyword(","))
	];
}

function GenerateUnnestClause(options) {
	return [
		Keyword("UNNEST"),
		Expression(),
		Keyword(",")
	];
}

function GenerateLimitAndOrderBy(options) {
	return [
		Optional(Sequence(GenerateOrderBy(options))),
		Optional(Sequence([
			Keyword("LIMIT"),
			Expression(),
			Optional(Sequence([
				Keyword("OFFSET"),
				Expression()
			]), "skip")
		]))
	]
}

function GenerateWhereClause(options) {
	return [
		Keyword("WHERE"),
		Expression()
	];
}

function GenerateSelectNode(options) {
	return [Stack([
		Sequence(
			GenerateSelectClause(options)
		),
		Sequence([
			Optional(Sequence(GenerateFromClause(options))),
			Optional(
				Sequence(GenerateWhereClause(options))
			)
		]),
		Sequence(
			GenerateGroupByClause(options)
		),
		Optional(Sequence(GenerateWindowClause(options)), "skip"),
		Optional(Sequence(GenerateUnnestClause(options)), "skip"),
		Sequence(GenerateLimitAndOrderBy(options))
	])]
}

function GenerateSetOperation(options) {
	return [
		Choice(0, [
			Keyword("UNION"),
			Keyword("UNION ALL"),
			Keyword("INTERSECT"),
			Keyword("EXCEPT")
		])
	]
}

function GenerateCTE(options) {
	return [
		Sequence([
			Keyword("WITH"),
			Optional(Keyword("RECURSIVE"), "skip"),
			OneOrMore(
				Sequence(GenerateCommonTableExpression()),
				","
			)
		])]
}

function GenerateSelect(options = {}) {
	return Diagram([
		Stack([
			Optional(Expandable("common-table-expr", options, "common-table-expr", GenerateCTE), "skip"),
			OneOrMore(Choice(0, [
				Expandable("select-node", options, "select-node", GenerateSelectNode),
				Expandable("values-list", options, "values", GenerateValues)
			]), Expandable("set-operation", options, "set-operation", GenerateSetOperation))
		])
	])
}

function Initialize(options = {}) {
	document.getElementById("rrdiagram").innerHTML = GenerateSelect(options).toString();
	document.getElementById("rrdiagram2").innerHTML = Diagram(GenerateCTE(options)).toString();
	document.getElementById("rrdiagram3").innerHTML = Diagram(GenerateSelectClause(options)).toString();
	document.getElementById("rrdiagram4").innerHTML = Diagram(GenerateFromClause(options)).toString();
	document.getElementById("rrdiagram5").innerHTML = Diagram(GenerateWhereClause(options)).toString();
	document.getElementById("rrdiagram6").innerHTML = Diagram(GenerateGroupByClause(options)).toString();
	document.getElementById("rrdiagram7").innerHTML = Diagram(GenerateWindowClause(options)).toString();
	document.getElementById("rrdiagram11").innerHTML = Diagram(GenerateUnnestClause(options)).toString();
	document.getElementById("rrdiagram8").innerHTML = Diagram(GenerateLimitAndOrderBy(options)).toString();
	document.getElementById("rrdiagram9").innerHTML = Diagram(GenerateValues(options)).toString();
	document.getElementById("rrdiagram10").innerHTML = Diagram(GenerateSampleClause(options)).toString();

	document.getElementById("rrdiagram2").classList.add("limit-width");
	document.getElementById("rrdiagram3").classList.add("limit-width");
	document.getElementById("rrdiagram4").classList.add("limit-width");
	document.getElementById("rrdiagram5").classList.add("limit-width");
	document.getElementById("rrdiagram6").classList.add("limit-width");
	document.getElementById("rrdiagram7").classList.add("limit-width");
	document.getElementById("rrdiagram8").classList.add("limit-width");
	document.getElementById("rrdiagram9").classList.add("limit-width");
	document.getElementById("rrdiagram10").classList.add("limit-width");
}

function Refresh(node_name, set_node) {
	options[node_name] = set_node;
	Initialize(options);
}

options = {}
Initialize()

