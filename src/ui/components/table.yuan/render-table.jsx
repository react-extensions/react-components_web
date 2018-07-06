function (fixedTable) {
      return (
        <div style={fixedTable ? null : { width: computeWidth || 'auto' }} className={(fixedTable ? 'fixed-left__table ' : '') + (showShadow && fixedTable ? 'shadow ' : '')}>
          <div className="table-thead" >
            <table border='0' cellSpacing='0' cellPadding={0} >
              {renderCol()}
              <thead>
                <tr>
                  {
                    columns.map((th, i) => {
                      if (fixedTable && !th.fixed) return null
                      if (!fixedTable && th.fixed) return (<th key={'th' + i}></th>)
                      return (
                        <th className={'th'}
                          key={'th' + i}
                          onClick={th.type === 'checkbox' ? this.checkedAll.bind(this) : null} >
                          {
                            th.type === 'checkbox' ? <Icon type={checkedStatus === 1 ? 'check-fill' : 'check'} />
                              : (th.type === 'expand' || th.type === 'index') ? null
                                : <span ref={this.initialized ? null : el => { if (!el) return; this.thMinWidth[i] = el.offsetWidth }} className='th-content' >
                                  {th.label}
                                  <i className='th-border' onMouseDown={e => this.prepareResizeCol(e, i)}></i>
                                </span>
                          }
                        </th>
                      )
                    })
                  }
                  {
                    (!fixedTable && placeholder) && <th className='th th__placeholder' width={placeholder} style={{ width: placeholder }}></th>
                  }
                </tr>
              </thead>
            </table>
          </div>
          <div className="table-tbody"
            style={tbodyHeight ? { height: tbodyHeight - (this.xAxisBlank || 0) - (this.fixedRowsHeight || 0) } : null}/* 规定大于此高度显示滚动 */
            ref={(el => fixedTable ? this.fixedTbody = el : this.plainTbody = el)}/* 同步滚动固定列 和  显示placeholder */
            onScroll={(!hasFixed || fixedTable) ? null : e => this.scrollBody(e)}/* 同步滚动 固定列 */
          >
            {
              rows && rows.length > 0 ? (
                <table border='0' cellSpacing='0' cellPadding={0} >
                  {renderCol()}
                  <tbody className='tbody'>
                    {rows.map((tr, i) => (
                      <Row key={'tr' + i}
                        rowIndex={i}
                        fixedTable={fixedTable}
                        columns={columns} tr={tr}
                        onChecked={this.checkedRow}
                        checkedStatus={checkedStatus}
                        bgColor={zebra && (i % 2 === 0 ? 'lighten' : 'darken')}
                        widthList={widthList}
                        resizeColToMax={this.resizeColToMax.bind(this)}
                        syncRow={hasFixed ? this.syncRow.bind(this) : null}
                        syncHoverRow={syncHoverRow}
                        syncExpandRow={syncExpandRow}
                      />
                    ))}
                  </tbody>
                </table>
              ) : !fixedTable ? (<div className='empty-table-tip'>{emptyTip || (<span className='empty-tip__span'>暂无数据</span>)}</div>) : null
            }
          </div>

        </div>
      )
    }