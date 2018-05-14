import React from 'react'
import style from './table.scss'


class Table extends React.Component {
    render() {
        const {className, children, width, thead, tbody} = this.props

        return (
            <table border='0' cellSpacing='0' cellPadding = {0} className = {'table ' + (className || '')}>
              <colgroup>
                {
                  width && width.map((item, i) => (<col className="table-col" key={i} style={{width: item}} width={item}></col>))
                }
              </colgroup>
              {
                thead && (
                  <thead>
                    <tr>
                      {
                        thead.map((item,i) => (
                          <th className='th' key={'th'+i} >{item}</th>
                        ))
                      }
                    </tr>
                  </thead>
                ) 
              }
              
              {
                (tbody || children) && (<tbody className= 'tbody'>
                  {children || tbody.map((tr, i) => (
                    <tr className='tr' key={'tr' + i}>
                      {
                        Object.keys(tr).map((td, j) => (
                          <td key={'td' + i + j} className='td'>{tr[td]}</td>
                        ))
                      }
                    </tr>
                  ))}
                </tbody>)
              }

          </table> 
        )
    }
}

export default Table