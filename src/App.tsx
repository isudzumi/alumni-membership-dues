import { useState } from 'react'
import { Button, FormControlLabel, Switch, Card, CardContent, Typography } from '@mui/material';

function App() {
  const [isAnnualPayment, setIfAnnualPayment] = useState(true)

  return (
    <Card>
      <CardContent>
        <Typography variant='h5' component='h1'>
          志空会 年会費
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          ¥2000{isAnnualPayment ? '（毎年）' : '（1回のみ）'}
        </Typography>
        <form method='POST' action='/create-checkout-session' name='shikukai-payment'>
          <FormControlLabel control={
            <Switch checked={isAnnualPayment}
              name='isAnnualPayment'
              value='true'
              onChange={() => setIfAnnualPayment(!isAnnualPayment)}
              inputProps={{ role: 'switch' }}
            />
          } label="定期支払いにする" />
          <Button id="checkout-and-portal-button" type="submit" variant="contained">
            支払う
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default App
