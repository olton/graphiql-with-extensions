import React, {Component} from 'react';
import GraphiQL from 'graphiql';
import GraphiQLExplorer from 'graphiql-explorer';
import {buildClientSchema, getIntrospectionQuery, parse} from 'graphql';

class GraphiQLWithExtensions extends Component {
  _graphiql: GraphiQL;
  state = {
    schema: null,
    query: this.props.defaultQuery,
    explorerIsOpen: true,
    disableExplorer: this.props.disableExplorer,
    disableExporter: this.props.disableExporter,
  };

  componentDidMount() {
    this.props
      .fetcher({
        query: getIntrospectionQuery(),
      })
      .then(result => {
        const editor = this._graphiql.getQueryEditor();
        editor.setOption('extraKeys', {
          ...(editor.options.extraKeys || {}),
          'Shift-Alt-LeftClick': this._handleInspectOperation,
        });

        this.setState({schema: buildClientSchema(result.data)});
      });
  }

  _handleInspectOperation = (cm: any, mousePos: {line: Number, ch: Number}) => {
    let parsedQuery;
    try {
      parsedQuery = parse(this.state.query || '');
    } catch (error) {
      console.error('Error parsing query: ', error);
      return;
    }
    if (!parsedQuery) {
      console.error("Couldn't parse query document");
      return null;
    }

    const token = cm.getTokenAt(mousePos);
    const start = {line: mousePos.line, ch: token.start};
    const end = {line: mousePos.line, ch: token.end};
    const relevantMousePos = {
      start: cm.indexFromPos(start),
      end: cm.indexFromPos(end),
    };

    const position = relevantMousePos;

    const def = parsedQuery.definitions.find(definition => {
      if (!definition.loc) {
        console.log('Missing location information for definition');
        return false;
      }

      const {start, end} = definition.loc;
      return start <= position.start && end >= position.end;
    });

    if (!def) {
      console.error(
        'Unable to find definition corresponding to mouse position',
      );
      return null;
    }

    const operationKind =
      def.kind === 'OperationDefinition'
        ? def.operation
        : def.kind === 'FragmentDefinition'
        ? 'fragment'
        : 'unknown';

    const operationName =
      def.kind === 'OperationDefinition' && Boolean(def.name)
        ? def.name.value
        : def.kind === 'FragmentDefinition' && Boolean(def.name)
        ? def.name.value
        : 'unknown';

    const selector = `.graphiql-explorer-root #${operationKind}-${operationName}`;

    const el = document.querySelector(selector);
    el && el.scrollIntoView();
  };

  _handleEditQuery = (query: string): void => {
    this.setState({query});
    if (this.props.onEditQuery) {this.props.onEditQuery(query);}
  };

  _handleEditVariables = variables => {
    if (this.props.onEditVariables) {this.props.onEditVariables(variables);}
  };

  _handleEditOperationName = operation => {
    if (this.props.onEditOperationName)
      {this.props.onEditOperationName(operation);}
  };

  _handleToggleExplorer = () => {
    this.setState({explorerIsOpen: !this.state.explorerIsOpen});
  };

  _handleToggleCodeExporter = () =>
    this.setState({
      codeExporterIsOpen: !this.state.codeExporterIsOpen,
    });

  render() {
    const {query, schema} = this.state;

    return (
      <div className="graphiql-container">
        {this.props.disableExplorer ? null : (
          <GraphiQLExplorer
            schema={schema}
            query={query}
            onEdit={this._handleEditQuery}
            explorerIsOpen={this.state.explorerIsOpen}
            onToggleExplorer={this._handleToggleExplorer}
          />
        )}
        <GraphiQL
          ref={ref => (this._graphiql = ref)}
          fetcher={this.props.fetcher}
          schema={schema}
          query={query}
          onEditQuery={this._handleEditQuery}
          onEditVariables={this._handleEditVariables}
          onEditOperationName={this._handleEditOperationName}>
          <GraphiQL.Toolbar>
            <GraphiQL.Button
              onClick={() => this._graphiql.handlePrettifyQuery()}
              label="Prettify"
              title="Prettify Query (Shift-Ctrl-P)"
            />
            <GraphiQL.Button
              onClick={() => this._graphiql.handleToggleHistory()}
              label="History"
              title="Show History"
            />
            {this.props.disableExplorer ? null : (
              <GraphiQL.Button
                onClick={this._handleToggleExplorer}
                label="Explorer"
                title="Toggle Explorer"
              />
            )}
            {this.props.disableExporter ? null : (
              <GraphiQL.Button
                onClick={this._handleToggleCodeExporter}
                label="Exporter"
                title="Toggle Code Exporter"
              />
            )}
          </GraphiQL.Toolbar>
        </GraphiQL>
      </div>
    );
  }
}

export default GraphiQLWithExtensions;
