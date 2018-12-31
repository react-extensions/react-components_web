  /*--- 调整表格列大小 ---*/
    getOffsetLeft(e) {
        const C = this.containerEl.current
        const P = C.getBoundingClientRect()
        return e.clientX - P.left + C.scrollLeft
    }

    prepareResizeCol(e, index, type) {
        e.preventDefault()
        e.stopPropagation()

        // 记录调整的  1. 列索引  2. 初始位置

        this.resizeData = { index, type, offset: this.getOffsetLeft(e) }

        document.addEventListener('mousemove', this.moveSign)
        document.addEventListener('mouseup', this.resizeCol)
    }

    /*--- 修改指示器位置 ---*/
    moveSign(e) {
        this.setState({ signOffset: this.getOffsetLeft(e) })
    }

    resizeCol() {
        document.removeEventListener('mousemove', this.moveSign)
        document.removeEventListener('mouseup', this.resizeCol)

        const offset = this.state.signOffset

        if (!offset) return

        const data = this.resizeData
        const maxWidthInCol = this.colMinRenderWidthList[data.index]
        // 根据每列的表头, 设置最小宽度
        const minWidthExact = this.colMinZoomWidthList[data.index]

        let newWidth = maxWidthInCol + offset - data.offset

        newWidth < minWidthExact && (newWidth = minWidthExact)

        // const { left, right, plain } = this.tableWidth
        const containerWidth = (this.containerEl.current.clientWidth - this.scrollBarY)// 容器宽度
        //位移差, 调整了的宽度
        let diff = newWidth - maxWidthInCol
        //                   容器宽度 - 新的总宽度
        let subDiff = containerWidth - (this.tableWidth.total + diff)


        if (subDiff > 0) {  // 如果新总宽度 小于容器宽度, 禁止缩小
            newWidth += subDiff
            diff += subDiff
        }

        // 记录  并调整表格总宽度
        this.tableWidth[data.type] += diff
        this.tableWidth.total += diff

        // 记录  并调整  对应列的宽度
        this.colMinRenderWidthList[data.index] = newWidth
        // 判断要不要显示水平轴 滚动条 
        // -5 只是一个大概值，因为js计算有误差，不能以 0 作为判断
        this.scrollBarX = subDiff < -5 ? SCROLL_BAR_WIDTH : 0

        // 把标志线归零 , 顺便触发整个更新
        this.setState({ signOffset: 0 })
    }


    fixedBottomHeight(el) {
        if (!el) return
        this.setState({
            fixedBottomHeight: el.clientHeight
        })
    }


    //* 表格排序
    sortData(key, colConfig) {
        const map = this.state.sortMap
        const order = map.current === key ? (map.order === ASC ? DESC : ASC) : ASC

        const newState = { sortMap: { current: key, order: order } }
        this.setState(newState)

        this.props.onSortChange({ prop: key, order: order }, colConfig)
    }

    /*
     * 排序rows 并返回新的rows
     * */
    sortRows(rows) {
        // 如果排序规则没变, 表格数据没变, 且有 已经排序过的 rows数据, 则直接用已经排序过的

        if (!this.sortedRows || this.rows !== this.props.rows || this.sortMap !== this.state.sortMap) {
            // 缓存上次状态
            this.rows = this.props.rows
            this.sortMap = this.state.sortMap

            const match = this.sortMap.current
            const rule = this.sortMap.order === ASC ? 1 : -1

            this.sortedRows = rows.sort((p, n) => {
                return (n[match] - p[match]) * rule
            })
        }

        return this.sortedRows
    }


    
    /*----------------------*/
    /* ---- 同步表格行 ---- */
    /*----------------------*/
    syncRow(type, syncData) {
        this.setState(prev => (
            { syncData: Object.assign({}, prev.syncData, { [type]: syncData }) }
        ))
    }


    /*--- 切换表格全选中 ---*/
    checkedAll() {
        const props = this.props
        const rows = props.rows
        const bool = this.state.checkStatus === 1

        this.setState({ checkStatus: bool ? -1 : 1 })

        this.checkedList = bool || (!rows || rows.length === 0) ? [] : [...rows]
        props.onSelectRowChange(this.checkedList)
    }

    /*--- 切换表格行选中 ---*/
    checkedRow(row, isChecked, rowIndex) {
        const emit = this.props.onSelectRowChange

        if (this.checkState === CHECK_TYPE.RADIO) { // 单选表格
            emit([row])
            return
        }

        const oldList = this.checkedList

        // 根据选中还是不选择, 从checkedList 添加 或  清除 该项
        oldList[rowIndex] = isChecked ? row : null

        // 格式化结构用于向外层发送
        const arr = oldList.filter(item => !!item)

        // 判断总体选中状态  全选中, quanweixuanz
        const len = arr.length
        const max = this.props.rows.length
        const newStatus = max === len ? 1 : len === 0 ? -1 : 0

        this.state.checkStatus !== newStatus && this.setState({ checkStatus: newStatus })

        emit(arr)
    }