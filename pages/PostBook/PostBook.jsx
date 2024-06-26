import { Box, Typography, Breadcrumbs, Link, FormControl, Select, MenuItem } from '@mui/material'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import AddBook from './Form/AddBook'

import { mockData } from '../../apis/mockdata'
import BookToEdit from '../../components/BookToEdit/BookToEdit'

function PostBook() {
  const [update, setUpdate] = useState(0)
  const [books, setbooks] = useState(mockData?.books)
  const book = books[0]
  const [page, setPage] = useState(0)
  const [select, setSelect] = useState(1)

  const handleChange = (event) => {
    setSelect(event.target.value)
  }
  return (
    <Box sx={{ m: { xs: 1, sm: 2, md: 5 } }} bgcolor= {(theme) => (theme.palette.mode === 'dark' ? '#363636' : '#E6E6FA')}>
      <Breadcrumbs aria-label="breadcrumb">
            <Link underline="hover" color="inherit" href="/">Trang chủ</Link>
            <Typography color="text.primary">Đăng truyện</Typography>
          </Breadcrumbs>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <AddBook setUpdate={setUpdate} />
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 2 }}>
          <Typography variant='body1' fontWeight={'bold'} >Sắp xếp</Typography>
          <FormControl size={'small'} sx={{ m: 1, minWidth: 120 }}>
            <Select value={select} onChange={handleChange} >
              <MenuItem value={1}>Mới nhất</MenuItem>
              <MenuItem value={2}>Cũ nhất</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>
      <BookToEdit book={book}/>
    </Box>
  )
}

export default PostBook